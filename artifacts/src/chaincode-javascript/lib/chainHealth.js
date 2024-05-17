"use strict";

const Ledger = require("./ledger.js");
const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

const ledger = new Ledger();

/* prettier-ignore */
const ERROR_MESSAGES = {
  INIT_LEDGER: "Error occurred while initializing ledger: ",
  GET_RECORD: "Error occurred while getting record: ",
  UPDATE_PRESCRIPTION: "Error occurred while updating the patient prescription: ",
  CONFIRM_PRESCRIPTION: "Error occurred while confirming prescription: ",
  LOGIN: "Invalid username or password!"
};

class EHRContract extends Contract {
  /**
   * Initializes the ledger with initial data.
   * @param {Context} ctx The transaction context.
   * @returns {string} A message indicating the success of ledger initialization.
   * @throws {Error} If an error occurs during ledger initialization.
   */
  async InitLedger(ctx) {
    try {
      // Storing patient data
      for (const patientRecord of patientRecords) {
        const hashedPassword = this._hashPassword(patientRecord.password);
        patientRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, patientRecord.id, patientRecord);
      }

      // Storing pharmacy data
      for (const pharmRecord of pharmacyRecords) {
        const hashedPassword = this._hashPassword(pharmRecord.password);
        pharmRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, pharmRecord.id, pharmRecord);
      }

      // storing doctor records
      for (const doctorRecord of doctorRecords) {
        const hashedPassword = this._hashPassword(doctorRecord.password);
        doctorRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, doctorRecord.id, doctorRecord);
      }

      // Storing insurance records
      for (const insuranceRecord of insuranceRecords) {
        const hashedPassword = this._hashPassword(insuranceRecord.password);
        insuranceRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, insuranceRecord.id, insuranceRecord);
      }

      // Storing medicine information
      await ledger.writeRecord(ctx, "Medicines", medicineList);

      return "Successfully initialized the ledger!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INIT_LEDGER + error);
    }
  }

  /**
   * Retrieves all records from the ledger.
   * @param {Context} ctx The transaction context.
   * @returns {string} JSON string representing all records.
   * @throws {Error} If an error occurs while retrieving records.
   */
  async getAllRecords(ctx) {
    try {
      return await ledger.getAllRecords(ctx);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_RECORD + error);
    }
  }

  _calculateAge(birthDateString) {
    // Parse the birth date string to a Date object
    const birthDate = new Date(birthDateString);
    // Get the current date
    const today = new Date();

    // Calculate the age
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust the age if the birth date hasn't occurred yet this year
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  _getPrescriptionIds(prescriptionList) {
    const ids = [];
    for (let i = 0; i < prescriptionList.length - 1; i++) {
      ids.push(prescriptionList[i].prescriptionID);
    }
    return ids;
  }

  _createPrescriptionObjectPharmacy(prescriptions) {
    const prescArray = [];
    for (const prescription of prescriptions) {
      const tempObject = {
        prescriptionId: prescription.prescriptionID,
        state: prescription.state,
      };
      prescArray.push(tempObject);
    }
    return prescArray;
  }

  /**
   * Retrieves patient information based on the provided patient ID.
   * @param {Context} ctx The transaction context.
   * @param {string} patientId The ID of the patient.
   * @returns {object} Patient information.
   * @throws {Error} If an error occurs while retrieving patient information.
   */
  async getPatientInfo(ctx, patientId) {
    try {
      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) {
        throw patientData;
      }

      // parse the patient Data
      const parsedData = JSON.parse(patientData);
      const clientMSP = ledger.getMSPID(ctx);

      // Return the desired patient information
      let info;
      switch (clientMSP) {
        case "PharmacyMSP":
          const prescription = this._createPrescriptionObjectPharmacy(
            parsedData.prescription
          );
          info = {
            balance: parsedData.balance.remainingBalance,
            prescription: prescription,
          };
          break;
        case "DoctorMSP":
          const age = this._calculateAge(
            parsedData.personalInformation.dateOfBirth
          );
          const prescIds = this._getPrescriptionIds(parsedData.prescription);
          info = {
            firstName: parsedData.personalInformation.firstName,
            lastName: parsedData.personalInformation.lastName,
            age: age,
            gender: parsedData.personalInformation.gender,
            chronicDiseases: parsedData.medicalHistory.chronicDiseases,
            allergies: parsedData.medicalHistory.allergies,
            surgeries: parsedData.medicalHistory.surgeries,
            medications: parsedData.medicalHistory.medications,
            oldPrescription: prescIds,
          };
          break;
        case "InsuranceMSP":
          info = {
            firstName: parsedData.personalInformation.firstName,
            lastName: parsedData.personalInformation.lastName,
            dateOfBirth: parsedData.personalInformation.dateOfBirth,
            gender: parsedData.personalInformation.gender,
            insuranceInformation: parsedData.insuranceInformation,
          };
          break;
        case "MinistryofhealthMSP":
          info = parsedData;
          break;
        default:
          throw new Error("You don't have access to this record!");
      }
      return info;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_RECORD + error);
    }
  }

  /**
   * Retrieves pharmacy information based on the provided pharmacy ID.
   * @param {Context} ctx The transaction context.
   * @param {string} pharmacyId The ID of the pharmacy.
   * @returns {object} Pharmacy information.
   * @throws {Error} If an error occurs while retrieving pharmacy information.
   */
  async getPharmacyInfo(ctx, pharmacyId) {
    try {
      const pharmacyData = await ledger.queryRecord(ctx, pharmacyId);

      // If pharmacy is not found
      if (pharmacyData instanceof Error) {
        throw pharmacyData;
      }

      // Parse the patient data
      const parsedData = JSON.parse(pharmacyData);
      const clientMSP = ledger.getMSPID(ctx);

      if (clientMSP === "MinistryofhealthMSP") {
        return {
          pharmacyName: parsedData.pharmacyName,
          pharmacyAddress: parsedData.phramacyAddress,
        };
      } else {
        throw new Error("You don't hace access to this record");
      }
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_RECORD + error);
    }
  }

  async _updatePrescription(ctx, patientDataJSON, issuingDoctor, prescription) {
    try {
      // Calulate the prescriptionId
      const prescriptionId = `pres${patientDataJSON.prescription.length + 1}`;

      const prescriptionObject = {
        prescriptionID: prescriptionId,
        state: "issued",
        issuingDoctor: issuingDoctor,
        medicines: prescription,
      };
      patientDataJSON.prescription.push(prescriptionObject);
      patientDataJSON.medicalHistory.medications = prescription;
      await ledger.writeRecord(ctx, patientDataJSON.id, patientDataJSON);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UPDATE_PRESCRIPTION + error);
    }
  }

  async _createPrescriptionObject(ctx, prescription) {
    const medicineNames = prescription.split(",");
    const medicineObject = [];

    const medList = await ledger.queryRecord(ctx, "Medicines");
    const medListParsed = JSON.parse(medList);

    for (const medicineName of medicineNames) {
      const medicine = medListParsed.find(
        (medicine) => medicine.name === medicineName
      );
      if (medicine) {
        const temp = {
          medicineName: medicine.name,
          description: medicine.description,
          frequency: medicine.frequency,
        };
        medicineObject.push(temp);
      } else {
        throw new Error(ERROR_MESSAGES.UPDATE_PRESCRIPTION);
      }
    }
    return medicineObject;
  }

  /**
   * Writes a prescription for a patient.
   * @param {Context} ctx The transaction context.
   * @param {string} patientId The ID of the patient.
   * @param {string} issuingDoctor The doctor issuing the prescription.
   * @param {string} prescription The prescription details.
   * @returns {string} A message indicating the success of prescription writing.
   * @throws {Error} If an error occurs while writing the prescription.
   */
  async writePatientPrescription(ctx, patientId, issuingDoctor, prescription) {
    try {
      const clientMSP = ledger.getMSPID(ctx);
      if (clientMSP !== "DoctorMSP") {
        throw new Error("You don't have the privilege to write prescriptions!");
      }

      const patientData = await ledger.queryRecord(ctx, patientId);
      console.log(patientData);
      // If patient is not found
      if (patientData instanceof Error) {
        throw patientData;
      }

      // Parse Patient Data
      const parsedData = JSON.parse(patientData);

      const prescriptionData = await this._createPrescriptionObject(
        ctx,
        prescription
      );
      if (prescription instanceof Error) {
        throw prescription;
      }

      await this._updatePrescription(
        ctx,
        parsedData,
        issuingDoctor,
        prescriptionData
      );
      return "Updated the prescription seccessfully!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UPDATE_PRESCRIPTION);
    }
  }

  _getPrescriptionById(prescriptionList, prescriptionId) {
    for (const prescription of prescriptionList) {
      if (prescription.prescriptionID === prescriptionId) {
        return prescription;
      }
    }
    throw new Error(ERROR_MESSAGES.UPDATE_PRESCRIPTION);
  }

  _confirmPrescriptionSalePatient(prescription) {
    prescription.state = "purchased";
  }

  async _calculatePrescriptionCost(ctx, prescription) {
    const medListDB = await ledger.queryRecord(ctx, "Medicines");
    const medListDBParsed = JSON.parse(medListDB);
    let totalCost = 0;

    for (const medicine of prescription) {
      const medicineName = medicine.medicineName;

      const medicineDB = medListDBParsed.find(
        (medicine) => medicine.name === medicineName
      );

      totalCost += parseInt(medicineDB.cost);
    }
    return totalCost;
  }

  async _criteriaCheck(patientData) {
    if (patientData.insuranceInformation.state !== "active") {
      throw new Error("Inactive insurance subscription!");
    }
  }

  async _insuranceCheck(ctx, patientData, prescription) {
    const totalPrescriptionCost = await this._calculatePrescriptionCost(
      ctx,
      prescription
    );

    if (patientData.balance.remainingBalance < totalPrescriptionCost) {
      throw new Error("Insufficient balance!");
    } else {
      patientData.balance.remainingBalance -= totalPrescriptionCost;
    }
  }

  _confirmPrescriptionSalePharmacy(prescription, parsedPharmacyData) {
    prescription.state = "confirmed1";
    prescription.pharmacyName = parsedPharmacyData.pharmacyName;
    prescription.phramacyAddress = parsedPharmacyData.phramacyAddress;
  }

  /**
   * Confirms the sale of a prescription.
   * @param {Context} ctx The transaction context.
   * @param {string} patientId The ID of the patient.
   * @param {string} pharmacyId The ID of the pharmacy.
   * @param {string} presId The ID of the prescription.
   * @returns {string} A message indicating the success of prescription sale confirmation.
   * @throws {Error} If an error occurs while confirming the prescription sale.
   */
  async confirmPrescriptionSale(ctx, patientId, pharmacyId, presId) {
    try {
      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) {
        throw patientData;
      }

      const pharmacyData = await ledger.queryRecord(ctx, pharmacyId);
      if (pharmacyData instanceof Error) {
        throw pharmacyData;
      }

      //Parse Data
      const parsedPatientData = JSON.parse(patientData);
      const parsedPharmacyData = JSON.parse(pharmacyData);

      const prescription = this._getPrescriptionById(
        parsedPatientData.prescription,
        presId
      );
      if (prescription instanceof Error) {
        throw prescription;
      }

      const clientMSP = ledger.getMSPID(ctx);
      if (clientMSP !== "PharmacyMSP" && clientMSP !== "MinistryofhealthMSP") {
        throw new Error("Access Denied!");
      } else if (prescription.state === "purchased") {
        throw new Error(ERROR_MESSAGES.CONFIRM_PRESCRIPTION);
      }

      // criteria check
      this._criteriaCheck(parsedPatientData);

      if (clientMSP === "MinistryofhealthMSP") {
        await this._insuranceCheck(
          ctx,
          parsedPatientData,
          prescription.medicines
        );
        this._confirmPrescriptionSalePatient(prescription);
      } else if (clientMSP === "PharmacyMSP") {
        this._confirmPrescriptionSalePharmacy(prescription, parsedPharmacyData);
      }

      await ledger.writeRecord(ctx, parsedPatientData.id, parsedPatientData);
      return "Confirmed the prescription successfully!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.CONFIRM_PRESCRIPTION + error);
    }
  }

  _hashPassword(password) {
    const hash = crypto.createHash("sha256");
    hash.update(password);
    return hash.digest("hex");
  }

  _createPatientPageData(parsedData) {
    const prescriptionList = [];
    for (const presc of parsedData.prescription) {
      prescriptionList.unshift({
        prescId: presc.prescriptionID,
        prescState: presc.state,
      });
    }
    return {
      firstName: parsedData.personalInformation.firstName,
      lastName: parsedData.personalInformation.lastName,
      balance: parsedData.balance.remainingBalance,
      prescription: prescriptionList,
    };
  }

  async _createInsurancePageData(ctx) {
    const allRecords = await this.getAllRecords(ctx);
    const allRecordsParsed = JSON.parse(allRecords);
    const userRecords = [];

    for (const patientRecord of allRecordsParsed) {
      if (patientRecord.id?.includes("patient")) {
        const tempUser = {
          firstName: patientRecord.personalInformation.firstName,
          lastName: patientRecord.personalInformation.lastName,
          insuranceId: patientRecord.insuranceInformation.policyNumber,
          insuranceState: patientRecord.insuranceInformation.state,
          remainingBalance: patientRecord.balance.remainingBalance,
          claimedBalance: patientRecord.balance.claimedBalance,
        };
        userRecords.push(tempUser);
      }
    }
    return userRecords;
  }

  /**
   * Logs in a user with the provided username and password.
   * @param {Context} ctx The transaction context.
   * @param {string} username The username of the user.
   * @param {string} enteredPassword The entered password of the user.
   * @returns {string} Home page data depending on user type
   * @throws {Error} If an error occurs during the login process.
   */
  async login(ctx, username, enteredPassword) {
    try {
      const patientData = await ledger.queryRecord(ctx, username);
      if (patientData instanceof Error) {
        throw patientData;
      }

      const patientDataParsed = JSON.parse(patientData);
      const hashedPassword = patientDataParsed.password;
      const hashedEnteredPassword = this._hashPassword(enteredPassword);

      if (hashedPassword === hashedEnteredPassword) {
        // Check user type
        const MSPID = ledger.getMSPID(ctx);

        if (MSPID === "PharmacyMSP") {
          return {
            userType: "Pharmacy",
          };
        }
        if (MSPID === "DoctorMSP") {
          return {
            userType: "Doctor",
          };
        }
        if (MSPID === "MinistryofhealthMSP") {
          const pageData = this._createPatientPageData(patientDataParsed);
          return {
            pageData: pageData,
            userType: "MinistryofhealthMSP",
          };
        }
        if (MSPID === "InsuranceMSP") {
          const userData = await this._createInsurancePageData(ctx);
          return {
            userType: "Insurance",
            insuranceName: patientDataParsed.insuranceName,
            userData: userData,
          };
        } else {
          throw new Error("Invalid username or passwrod!");
        }
      } else {
        throw new Error("Invalid username or passwrod!");
      }
    } catch (error) {
      throw new Error(ERROR_MESSAGES.LOGIN + error);
    }
  }

  /**
   * Retrieves prescription information for a given user.
   * @param {object} ctx - The context objec
   * @param {string} username - The username of the patient for whom to retrieve prescription information.
   * @param {string} prescriptionId - The unique identifier of the specific prescription to retrieve.
   * @returns {String} A string that contains the presction information
   * @throws {Error} If any errors occur during data retrieval or processing.
   */
  async getPrescriptionInformation(ctx, username, prescriptionId) {
    try {
      const patientData = await ledger.queryRecord(ctx, username);
      if (patientData instanceof Error) {
        throw patientData;
      }
      const patientDataParsed = JSON.parse(patientData);
      if (!patientDataParsed.prescription) {
        throw "Patinet deoes not have any prescription!";
      }

      const prescInformation = this._getPrescriptionById(
        patientDataParsed.prescription,
        prescriptionId
      );
      if (prescInformation instanceof Error) {
        throw prescInformation;
      }
      return JSON.stringify(prescInformation);
    } catch (error) {
      throw new Error(error);
    }
  }
}

// Exporting the EHRContract class
module.exports = EHRContract;

// Sample patient records for ledger initialization
const patientRecords = [
  {
    id: "patient1",
    password: "patient12345",
    personalInformation: {
      firstName: "Seifeldin",
      lastName: "Sami",
      dateOfBirth: "2001-07-06",
      gender: "Male",
      contactInformation: {
        address: "123 Main St",
        city: "Anytown",
        state: "Anystate",
        country: "AnyCountry",
        postalCode: "12345",
        phoneNumber: "123-456-7890",
        email: "seif@gmail.com",
      },
    },
    medicalHistory: {
      chronicDiseases: ["Diabetes", "High Blood Pressure"],
      allergies: ["Peanuts"],
      surgeries: ["Appendectomy in 2015"],
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
        },
      ],
    },
    insuranceInformation: {
      provider: "Insurance Co.",
      policyNumber: "ins1",
      state: "active",
    },
    prescription: [
      {
        prescriptionID: "pres1",
        state: "purchased",
        issuingDoctor: "Dr. Smith",
        medicines: [
          {
            name: "Aspirin",
            dosage: "325mg",
            frequency: "Once daily as needed",
          },
          {
            name: "Ibuprofen",
            dosage: "200mg",
            frequency: "Every 4-6 hours as needed",
          },
        ],
      },
      {
        prescriptionID: "pres2",
        state: "purchased",
        issuingDoctor: "Dr. Jones",
        medicines: [
          {
            name: "Zyrtec",
            dosage: "10mg",
            frequency: "Once daily",
          },
        ],
      },
    ],
    balance: {
      remainingBalance: "100",
      claimedBalance: "500",
    },
  },
  {
    id: "patient2",
    password: "patient12345",
    personalInformation: {
      firstName: "Aisha",
      lastName: "Khan",
      dateOfBirth: "1985-01-15",
      gender: "Female",
      contactInformation: {
        address: "456 Elm St",
        city: "Big City",
        state: "CA",
        country: "USA",
        postalCode: "98765",
        phoneNumber: "555-555-5555",
        email: "aishu@example.com",
      },
    },
    medicalHistory: {
      chronicDiseases: ["Asthma"],
      allergies: ["Penicillin"],
      surgeries: ["None"],
      medications: [
        {
          name: "Albuterol inhaler",
          dosage: "2 puffs as needed",
          frequency: "N/A",
        },
      ],
    },
    insuranceInformation: {
      provider: "HealthCare Inc.",
      policyNumber: "ins222",
      state: "active",
    },
    prescription: [
      {
        prescriptionID: "pres1",
        state: "purchased",
        issuingDoctor: "Dr. Lee",
        medicines: [
          {
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "Twice daily for 7 days",
          },
        ],
      },
      {
        prescriptionID: "pres2",
        state: "purchased",
        issuingDoctor: "Dr. Williams",
        medicines: [
          {
            name: "Flonase nasal spray",
            dosage: "1 spray per nostril daily",
            frequency: "As needed",
          },
        ],
      },
    ],
    balance: {
      remainingBalance: "200",
      claimedBalance: "700",
    },
  },
];

const pharmacyRecords = [
  {
    id: "pharmacy1",
    pharmacyName: "El-Ezaby",
    phramacyAddress: "Al-Rehab 2",
    password: "pharmacy12345",
  },
  {
    id: "pharmacy2",
    pharmacyName: "El-Tarshouby",
    phramacyAddress: "Nasr City",
    password: "pharmacy12345",
  },
];

const doctorRecords = [
  {
    id: "doctor1",
    firstName: "Mina",
    lastName: "Saad",
    password: "doctor12345",
  },
  {
    id: "doctor2",
    firstName: "Peter",
    lastName: "Samy",
    password: "doctor12345",
  },
];

const insuranceRecords = [
  {
    id: "insurance1",
    insuranceName: "AXA",
    password: "insurance12345",
  },
  {
    id: "insurance2",
    insuranceName: "ALLIANZ",
    password: "insurance12345",
  },
];
/* prettier-ignore */
const medicineList = [
  { name: "Aspirin", description: "Pain reliever, 200mg tablets", cost: 15, frequency: 2 },
  { name: "Ibuprofen", description: "Pain reliever and fever reducer, 200mg tablets", cost: 18, frequency: 3 },
  { name: "Acetaminophen", description: "Pain reliever and fever reducer, 500mg tablets", cost: 12, frequency: 4 },
  { name: "Diphenhydramine", description: "Antihistamine, Sleep aid, 25mg tablets", cost: 10, frequency: 1 },
  { name: "Loratadine", description: "Antihistamine, Allergy relief, 10mg tablets", cost: 14, frequency: 1 },
  { name: "Cetirizine", description: "Antihistamine, Allergy relief, 10mg tablets", cost: 13, frequency: 1 },
  { name: "Amoxicillin", description: "Antibiotic, 500mg capsules", cost: 35, frequency: 3 },
  { name: "Azithromycin", description: "Antibiotic, 250mg tablets", cost: 40, frequency: 1 },
  { name: "Cephalexin", description: "Antibiotic, 500mg capsules", cost: 32, frequency: 4 },
  { name: "Albuterol", description: "Asthma inhaler", cost: 25, frequency: 2 },
  { name: "Salbutamol", description: "Asthma inhaler", cost: 22, frequency: 2 },
  { name: "Prednisone", description: "Steroid, 5mg tablets", cost: 30, frequency: 1 },
  { name: "Fluticasone", description: "Steroid inhaler", cost: 28, frequency: 2 },
  { name: "Metformin", description: "Diabetes medication, 500mg tablets", cost: 45, frequency: 2 },
  { name: "Glimepiride", description: "Diabetes medication, 2mg tablets", cost: 42, frequency: 1 },
  { name: "Insulin", description: "Diabetes medication (Varies by dose)", cost: 50, frequency: 3 },
  { name: "Atorvastatin", description: "Cholesterol medication, 20mg tablets", cost: 38, frequency: 1 },
  { name: "Simvastatin", description: "Cholesterol medication, 40mg tablets", cost: 40, frequency: 1 },
  { name: "Rosuvastatin", description: "Cholesterol medication, 10mg tablets", cost: 35, frequency: 1 },
  { name: "Lisinopril", description: "Blood pressure medication, 20mg tablets", cost: 28, frequency: 1 },
  { name: "Hydrochlorothiazide", description: "Blood pressure medication, 25mg tablets", cost: 20, frequency: 1 },
  { name: "Losartan", description: "Blood pressure medication, 50mg tablets", cost: 32, frequency: 1 },
  { name: "Escitalopram", description: "Antidepressant, 10mg tablets", cost: 25, frequency: 1 },
  { name: "Sertraline", description: "Antidepressant, 50mg tablets", cost: 30, frequency: 1 },
  { name: "Fluoxetine", description: "Antidepressant, 20mg tablets", cost: 22, frequency: 1 },
  { name: "Citalopram", description: "Antidepressant, 20mg tablets", cost: 28, frequency: 1 },
  { name: "Lexapro", description: "Antidepressant (Escitalopram), 10mg tablets", cost: 25, frequency: 1 },
  { name: "Zoloft", description: "Antidepressant (Sertraline), 50mg tablets", cost: 30, frequency: 1 },
  { name: "Prozac", description: "Antidepressant (Fluoxetine), 20mg tablets", cost: 22, frequency: 1 },
];
