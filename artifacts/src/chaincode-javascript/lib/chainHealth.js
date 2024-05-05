"use strict";

const Ledger = require("./ledger.js");
const { Contract } = require("fabric-contract-api");

const ledger = new Ledger();
const lastIdPatientKey = "patientIdCounter";
const lastIdDoctorKey = "doctorIdCounter";
const lastIdPharmacyKey = "pharmacyIdCounter";
const lastIdInsurancekey = "insuranceIdCounter";

// TODO: API calls (Last thing)
// TODO: Login functionality, using bcrypt library (HASH and salt rounds)
// TODO: Pagination functionality (Insurance (patient data), Patient (Medications), pharmacy (Medictaions))

// Done:
// 1- Added cost to medicines
// 2- Refactored the code
// 3- Fixed confirmation function
// 4- Insurance check (insurance state (active or not) and balance check)
// 5- Criteria check
// 5- Error handling

class EHRContract extends Contract {
  async InitLedger(ctx) {
    try {
      // Storing patient data
      for (const patientRecord of patientRecords) {
        await ledger.writeRecord(ctx, patientRecord.patientID, patientRecord);
      }

      // Storing pharmacy data
      for (const pharmRecord of pharmacyRecords) {
        await ledger.writeRecord(ctx, pharmRecord.pharmacyId, pharmRecord);
      }

      // Storing medicine information
      await ledger.writeRecord(ctx, "Medicines", medicineList);

      return "Successfully initialized the ledger!";
    } catch (error) {
      // TODO Change to throw
      return `Error occured while initializing record, ${error}`;
    }
  }

  // Private method to convert string to JSON
  _changeToJSON(strValue) {
    let temp;
    try {
      temp = JSON.parse(strValue);
    } catch (error) {
      temp = strValue;
    }
    return temp;
  }

  async getAllRecords(ctx) {
    try {
      const recordData = await ledger.getAllRecords(ctx);
      return recordData;
    } catch (error) {
      // TODO: Change to throw
      return `Error occured while getting all record, ${error}`;
    }
  }

  async getPatientInfo(ctx, patientId) {
    try {
      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) {
        // TODO: Change to throw
        return patientData;
      }

      // parse the patient Data
      const parsedData = this._changeToJSON(patientData);

      const clientMSP = ledger.getMSPID(ctx);

      // Return the desired patient information
      if (clientMSP === "DoctorMSP") {
        return {
          firstName: parsedData.personalInformation.firstName,
          lastName: parsedData.personalInformation.lastName,
          dateOfBirth: parsedData.personalInformation.dateOfBirth,
          gender: parsedData.personalInformation.gender,
          medicalHistory: parsedData.medicalHistory,
          prescription: parsedData.prescription,
        };
      } else if (clientMSP === "InsuranceMSP") {
        return {
          firstName: parsedData.personalInformation.firstName,
          lastName: parsedData.personalInformation.lastName,
          dateOfBirth: parsedData.personalInformation.dateOfBirth,
          gender: parsedData.personalInformation.gender,
          insuranceInformation: parsedData.insuranceInformation,
        };
      } else if (clientMSP === "MinistryofhealthMSP") {
        return parsedData;
      } else if (clientMSP === "PharmacyMSP") {
        return {
          firstName: parsedData.personalInformation.firstName,
          lastName: parsedData.personalInformation.lastName,
          dateOfBirth: parsedData.personalInformation.dateOfBirth,
          gender: parsedData.personalInformation.gender,
          prescription: parsedData.prescription,
        };
      } else {
        // Change to throw
        return "You don't have access to this record!";
      }
    } catch (error) {
      // TODO: Change to throw
      return `Error while getting record, ${error}`;
    }
  }

  async getPharmacyInfo(ctx, pharmacyId) {
    try {
      const pharmacyData = await ledger.queryRecord(ctx, pharmacyId);

      // If pharmacy is not found
      if (pharmacyData instanceof Error) {
        // TODO: Change to throw
        return pharmacyData;
      }

      // Parse the patient data
      const parsedData = this._changeToJSON(pharmacyData);

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
      // TODO: Change to throw
      return `${error}`;
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
      await ledger.writeRecord(ctx, patientDataJSON.patientID, patientDataJSON);
    } catch (error) {
      // TODO: Change to throw
      return error;
    }
  }

  async _createPrescriptionObject(ctx, prescription) {
    const medicineNames = prescription.split(",");
    const medicineObject = [];

    const medList = await ledger.queryRecord(ctx, "Medicines");
    const medListParsed = this._changeToJSON(medList);

    for (const medicineName of medicineNames) {
      const medicine = medListParsed.find(
        (medicine) => medicine.name === medicineName
      );
      if (medicine) {
        const temp = {
          medicineName: medicine.name,
          description: medicine.description,
        };
        medicineObject.push(temp);
      } else {
        // TODO: change to throw
        return "Medicine is not found!";
      }
    }
    return medicineObject;
  }

  // Method to write patient prescription, with access control
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
        // TODO: Change to throw
        return patientData;
      }

      // Parse Patient Data
      const parsedData = this._changeToJSON(patientData);

      const prescriptionData = await this._createPrescriptionObject(
        ctx,
        prescription
      );
      if (prescription instanceof Error) {
        // TODO: Change to throw
        return "Medicine is not covred by insurance!";
      }

      await this._updatePrescription(
        ctx,
        parsedData,
        issuingDoctor,
        prescriptionData
      );
      return "Updated the prescription seccessfully!";
    } catch (error) {
      throw new Error(
        `Error occurred while updating the patient prescription!, ${error}`
      );
    }
  }

  _getPrescriptionById(prescriptionList, prescriptionId) {
    for (let i = 0; i < prescriptionList.length; i++) {
      if (prescriptionList[i].prescriptionID === prescriptionId) {
        return prescriptionList[i];
      }
    }
    throw new Error("There is no prescription with the entered Id");
  }

  _confirmPrescriptionSalePatient(prescription) {
    prescription.state = "purchased";
    // TODO: Add balance calculations
  }

  async _calculatePrescriptionCost(ctx, prescription) {
    const medListDB = await ledger.queryRecord(ctx, "Medicines");
    const medListDBParsed = this._changeToJSON(medListDB);
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
      throw new Error(
        "This patient does not have active insurance subscription!"
      );
    }
  }

  async _insuranceCheck(ctx, patientData, prescription) {
    const totalPrescriptionCost = await this._calculatePrescriptionCost(
      ctx,
      prescription
    );

    if (patientData.balance.remainingBalance < totalPrescriptionCost) {
      throw new Error("Patient does not have sufficient balace!");
    } else {
      patientData.balance.remainingBalance -= totalPrescriptionCost;
    }
  }

  _confirmPrescriptionSalePharmacy(prescription, parsedPharmacyData) {
    prescription.state = "confirmed1";
    prescription.pharmacyName = parsedPharmacyData.pharmacyName;
    prescription.phramacyAddress = parsedPharmacyData.phramacyAddress;
  }

  async confirmPrescriptionSale(ctx, patientId, pharmacyId, presId) {
    try {
      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) {
        return patientData;
      }

      const pharmacyData = await ledger.queryRecord(ctx, pharmacyId);
      if (pharmacyData instanceof Error) {
        return pharmacyData;
      }

      //Parse Data
      const parsedPatientData = this._changeToJSON(patientData);
      const parsedPharmacyData = this._changeToJSON(pharmacyData);

      const prescription = this._getPrescriptionById(
        parsedPatientData.prescription,
        presId
      );
      if (prescription instanceof Error) {
        // TODO: Change to throw
        return prescription;
      }

      const clientMSP = ledger.getMSPID(ctx);
      if (clientMSP !== "PharmacyMSP" && clientMSP !== "MinistryofhealthMSP") {
        throw new Error("Access Denied!");
      } else if (prescription.state === "purchased") {
        // Change to throw
        return "Prescription already purchased!";
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

      await ledger.writeRecord(
        ctx,
        parsedPatientData.patientID,
        parsedPatientData
      );
      return "Confirmed the prescription successfully!";
    } catch (error) {
      // TODO: Change to throw
      return `Error while confirming prescription, ${error}`;
    }
  }
}

// Exporting the EHRContract class
module.exports = EHRContract;

// Sample patient records for ledger initialization
const patientRecords = [
  {
    patientID: "patient1",
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
        prescriptionID: "pres1", // Add prescription ID
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
    patientID: "patient2",
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
    pharmacyId: "pharmacy1",
    pharmacyName: "El-Ezaby",
    phramacyAddress: "Al-Rehab 2",
  },
  {
    pharmacyId: "pharmacy2",
    pharmacyName: "El-Tarshouby",
    phramacyAddress: "Nasr City",
  },
];

const doctorRecords = [];
const insuranceRecords = [];
/* prettier-ignore */
const medicineList = [
  { name: "Aspirin", description: "Pain reliever, 200mg tablets", cost: 15 },
  { name: "Ibuprofen", description: "Pain reliever and fever reducer, 200mg tablets", cost: 18 },
  { name: "Acetaminophen", description: "Pain reliever and fever reducer, 500mg tablets", cost: 12 },
  { name: "Diphenhydramine", description: "Antihistamine, Sleep aid, 25mg tablets", cost: 10 },
  { name: "Loratadine", description: "Antihistamine, Allergy relief, 10mg tablets", cost: 14 },
  { name: "Cetirizine", description: "Antihistamine, Allergy relief, 10mg tablets", cost: 13 },
  { name: "Amoxicillin", description: "Antibiotic, 500mg capsules", cost: 35 },
  { name: "Azithromycin", description: "Antibiotic, 250mg tablets", cost: 40 },
  { name: "Cephalexin", description: "Antibiotic, 500mg capsules", cost: 32 },
  { name: "Albuterol", description: "Asthma inhaler", cost: 25 },
  { name: "Salbutamol", description: "Asthma inhaler", cost: 22 },
  { name: "Prednisone", description: "Steroid, 5mg tablets", cost: 30 },
  { name: "Fluticasone", description: "Steroid inhaler", cost: 28 },
  { name: "Metformin", description: "Diabetes medication, 500mg tablets", cost: 45 },
  { name: "Glimepiride", description: "Diabetes medication, 2mg tablets", cost: 42 },
  { name: "Insulin", description: "Diabetes medication (Varies by dose)", cost: 50 },
  { name: "Atorvastatin", description: "Cholesterol medication, 20mg tablets", cost: 38 },
  { name: "Simvastatin", description: "Cholesterol medication, 40mg tablets", cost: 40 },
  { name: "Rosuvastatin", description: "Cholesterol medication, 10mg tablets", cost: 35 },
  { name: "Lisinopril", description: "Blood pressure medication, 20mg tablets", cost: 28 },
  { name: "Hydrochlorothiazide", description: "Blood pressure medication, 25mg tablets", cost: 20 },
  { name: "Losartan", description: "Blood pressure medication, 50mg tablets", cost: 32 },
  { name: "Escitalopram", description: "Antidepressant, 10mg tablets", cost: 25 },
  { name: "Sertraline", description: "Antidepressant, 50mg tablets", cost: 30 },
  { name: "Fluoxetine", description: "Antidepressant, 20mg tablets", cost: 22 },
  { name: "Citalopram", description: "Antidepressant, 20mg tablets", cost: 28 },
  { name: "Lexapro", description: "Antidepressant (Escitalopram), 10mg tablets", cost: 25 },
  { name: "Zoloft", description: "Antidepressant (Sertraline), 50mg tablets", cost: 30 },
  { name: "Prozac", description: "Antidepressant (Fluoxetine), 20mg tablets", cost: 22 },
];
