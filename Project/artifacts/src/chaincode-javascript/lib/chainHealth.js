"use strict";

const Ledger = require("./ledger.js");
const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");
const MedicalRecords = require("./records.js");

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
   * @see docs.js
   */
  async InitLedger(ctx) {
    const medicalRecords = new MedicalRecords();
    try {
      // Storing patient data
      const patientRecords = medicalRecords.getPatientRecords();
      for (const patientRecord of patientRecords) {
        const hashedPassword = this._hashPassword(patientRecord.password);
        patientRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, patientRecord.id, patientRecord);
      }

      // Storing pharmacy data
      const pharmacyRecords = medicalRecords.getPharmacyRecords();
      for (const pharmRecord of pharmacyRecords) {
        const hashedPassword = this._hashPassword(pharmRecord.password);
        pharmRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, pharmRecord.id, pharmRecord);
      }

      // storing doctor records
      const doctorRecords = medicalRecords.getDoctorRecords();
      for (const doctorRecord of doctorRecords) {
        const hashedPassword = this._hashPassword(doctorRecord.password);
        doctorRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, doctorRecord.id, doctorRecord);
      }

      // Storing insurance records
      const insuranceRecords = medicalRecords.getInsuranceRecords();
      for (const insuranceRecord of insuranceRecords) {
        const hashedPassword = this._hashPassword(insuranceRecord.password);
        insuranceRecord.password = hashedPassword;
        await ledger.writeRecord(ctx, insuranceRecord.id, insuranceRecord);
      }

      // Storing medicine information
      const medicineList = medicalRecords.getMedicineList();
      await ledger.writeRecord(ctx, "Medicines", medicineList);

      return "Successfully initialized the ledger!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INIT_LEDGER + error);
    }
  }

  async getAllRecords(ctx) {
    try {
      return await ledger.getAllRecords(ctx);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_RECORD + error);
    }
  }

  /**
   * @see docs.js
   */
  async login(ctx, username, enteredPassword) {
    try {
      const patientData = await ledger.queryRecord(ctx, username);
      if (patientData instanceof Error) throw patientData;

      const patientDataParsed = JSON.parse(patientData);
      const hashedPassword = patientDataParsed.password;
      const hashedEnteredPassword = this._hashPassword(enteredPassword);

      if (hashedPassword === hashedEnteredPassword) {
        return true;
      } else {
        throw new Error("Invalid username or password!");
      }
    } catch (error) {
      throw new Error(ERROR_MESSAGES.LOGIN + error);
    }
  }

  /**
   * @see docs.js
   */
  async getPatientInfo(ctx, patientId) {
    try {
      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) throw patientData;

      const parsedData = JSON.parse(patientData);
      const clientMSP = ledger.getMSPID(ctx);

      // Encapsulated the logic of fetching patient info based on MSP
      return this._getPatientInfoByMSP(parsedData, clientMSP);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_RECORD + error);
    }
  }

  /**
   * @see docs.js
   */
  async getHomePage(ctx, username) {
    try {
      const patientData = await ledger.queryRecord(ctx, username);
      if (patientData instanceof Error) throw patientData;

      const patientDataParsed = JSON.parse(patientData);
      const MSPID = ledger.getMSPID(ctx);

      // Encapsulated home page data fetching logic
      return this._getHomePageData(ctx, MSPID, patientDataParsed);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.LOGIN + error);
    }
  }

  /**
   * @see docs.js
   */
  async getPharmacyInfo(ctx, pharmacyId) {
    try {
      const pharmacyData = await ledger.queryRecord(ctx, pharmacyId);
      if (pharmacyData instanceof Error) throw pharmacyData;

      const parsedData = JSON.parse(pharmacyData);
      const clientMSP = ledger.getMSPID(ctx);

      if (clientMSP === "MinistryofhealthMSP") {
        return {
          pharmacyName: parsedData.pharmacyName,
          pharmacyAddress: parsedData.phramacyAddress,
        };
      } else {
        throw new Error("You don't have access to this record");
      }
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_RECORD + error);
    }
  }

  /**
   * @see docs.js
   */
  async writePatientPrescription(ctx, patientId, issuingDoctor, prescription) {
    try {
      const clientMSP = ledger.getMSPID(ctx);
      if (clientMSP !== "DoctorMSP") {
        throw new Error("You don't have the privilege to write prescriptions!");
      }

      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) throw patientData;

      const parsedData = JSON.parse(patientData);
      const parsedPrescription = JSON.parse(prescription);

      // Encapsulated prescription creation logic in a private method
      const prescriptionData = await this._createPrescriptionObject(
        ctx,
        parsedPrescription
      );
      // Encapsulated prescription update logic in a private method
      await this._updatePrescription(
        ctx,
        parsedData,
        issuingDoctor,
        prescriptionData
      );

      return "Updated the prescription successfully!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UPDATE_PRESCRIPTION + error.message);
    }
  }

  /**
   * @see docs.js
   */
  async confirmPrescriptionSalePharmacy(ctx, pharmacyId, patientId, presId) {
    try {
      const clientMSP = ledger.getMSPID(ctx);
      if (clientMSP !== "PharmacyMSP") throw new Error("Access Denied!");

      const pharmacyData = await ledger.queryRecord(ctx, pharmacyId);
      if (pharmacyData instanceof Error) throw pharmacyData;

      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) throw patientData;

      const parsedPatientData = JSON.parse(patientData);
      const parsedPharmacyData = JSON.parse(pharmacyData);

      const prescription = this._getPrescriptionById(
        parsedPatientData.prescription,
        presId
      );
      if (prescription instanceof Error) throw prescription;

      if (prescription.state === "purchased") {
        throw new Error("Prescription is already purchased!");
      }

      // Placeholder for any checks needed
      this._criteriaCheck(parsedPatientData);
      // Encapsulated prescription confirmation data update logic
      this._writeConfirmDataPharmacy(prescription, parsedPharmacyData);

      await ledger.writeRecord(ctx, parsedPatientData.id, parsedPatientData);
      return "Confirmed the prescription successfully!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.CONFIRM_PRESCRIPTION + error.message);
    }
  }

  /**
   * @see docs.js
   */
  async confirmPrescriptionSalePatient(ctx, patientId, presId) {
    try {
      const clientMSP = ledger.getMSPID(ctx);
      if (clientMSP !== "MinistryofhealthMSP") {
        throw new Error("Access Denied!");
      }

      const patientData = await ledger.queryRecord(ctx, patientId);
      if (patientData instanceof Error) {
        throw patientData;
      }

      //Parse Data
      const parsedPatientData = JSON.parse(patientData);

      const prescription = this._getPrescriptionById(
        parsedPatientData.prescription,
        presId
      );
      if (prescription instanceof Error) {
        throw prescription;
      }

      if (prescription.state === "purchased") {
        throw new Error("Prescription is alrady purchased!");
      }

      if (prescription.state !== "confirmed1") {
        throw new Error("Prescription must be confirmed by pharmacy first!");
      }
      await this._insuranceCheck(
        ctx,
        parsedPatientData,
        prescription.medicines
      );
      this._writeConfirmDataPatient(prescription);

      await ledger.writeRecord(ctx, parsedPatientData.id, parsedPatientData);
      return "Confirmed the prescription successfully!";
    } catch (error) {
      throw new Error(ERROR_MESSAGES.CONFIRM_PRESCRIPTION + error.message);
    }
  }

  /**
   * @see docs.js
   */
  async getPrescriptionInformation(ctx, username, prescriptionId) {
    try {
      const patientData = await ledger.queryRecord(ctx, username);
      if (patientData instanceof Error) throw patientData;

      const patientDataParsed = JSON.parse(patientData);
      if (!patientDataParsed.prescription)
        throw new Error("Patient does not have any prescription!");

      // Encapsulated prescription fetching logic
      const prescInformation = this._getPrescriptionById(
        patientDataParsed.prescription,
        prescriptionId
      );
      if (prescInformation instanceof Error) throw prescInformation;

      return JSON.stringify(prescInformation);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @see docs.js
   */
  async getInsuranceClaimsPageData(ctx, username) {
    try {
      const patientData = await ledger.queryRecord(ctx, username);
      if (patientData instanceof Error) throw patientData;

      const patientDataParsed = JSON.parse(patientData);
      const MSPID = ledger.getMSPID(ctx);
      if (MSPID !== "InsuranceMSP")
        throw new Error("You don't have access to these records!");

      // Encapsulated prescription list creation logic
      const prescription = this._createPrescriptionList(
        patientDataParsed.prescription
      );
      return {
        insuranceCompany: patientDataParsed.insuranceInformation.provider,
        firstName: patientDataParsed.personalInformation.firstName,
        lastName: patientDataParsed.personalInformation.lastName,
        claimedBalance: patientDataParsed.balance.claimedBalance,
        remainingBalance: patientDataParsed.balance.remainingBalance,
        prescription: prescription,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  _hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  _createPrescriptionList(prescriptions) {
    return prescriptions.map((prescription) => ({
      prescriptionId: prescription.prescriptionID,
      state: prescription.state,
    }));
  }

  _getPrescriptionIds(prescriptionList) {
    return prescriptionList.map((prescription) => prescription.prescriptionID);
  }

  _calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  _getPatientInfoByMSP(parsedData, clientMSP) {
    let info;
    switch (clientMSP) {
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
      case "InsuranceMSP":
        info = {
          firstName: parsedData.personalInformation.firstName,
          lastName: parsedData.personalInformation.lastName,
          dateOfBirth: parsedData.personalInformation.dateOfBirth,
          gender: parsedData.personalInformation.gender,
          insuranceInformation: parsedData.insuranceInformation,
        };
        break;
      case "PharmacyMSP":
        const prescription = this._createPrescriptionList(
          parsedData.prescription
        );
        info = {
          balance: parsedData.balance.remainingBalance,
          prescription: prescription,
          firstName: parsedData.personalInformation.firstName,
          lastName: parsedData.personalInformation.lastName,
        };
        break;
      default:
        throw new Error("You don't have access to this record");
    }
    return info;
  }

  async _createPrescriptionObject(ctx, prescription) {
    const enteredMedicines = prescription.medicine;
    const medicineArray = [];

    const medList = await ledger.queryRecord(ctx, "Medicines");
    const medListParsed = JSON.parse(medList);

    for (const med of enteredMedicines) {
      const foundMedicine = medListParsed.find(
        (medicine) => medicine.name === med.name
      );
      if (foundMedicine) {
        const temp = {
          medicineName: foundMedicine.name,
          description: foundMedicine.description,
          frequency: med.frequency,
          dosage: med.dosage,
        };
        medicineArray.push(temp);
      } else {
        throw new Error("Medicine does not exist!");
      }
    }
    return {
      report: prescription.report,
      medicine: medicineArray,
    };
  }

  async _updatePrescription(ctx, patientDataJSON, issuingDoctor, prescription) {
    try {
      const prescriptionId = `pres${patientDataJSON.prescription.length + 1}`;

      const prescriptionObject = {
        prescriptionID: prescriptionId,
        state: "issued",
        issuingDoctor: issuingDoctor,
        medicines: prescription.medicine,
        report: prescription.report,
      };
      patientDataJSON.prescription.push(prescriptionObject);
      patientDataJSON.medicalHistory.medications = prescription;
      await ledger.writeRecord(ctx, patientDataJSON.id, patientDataJSON);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UPDATE_PRESCRIPTION + error);
    }
  }

  async _criteriaCheck(patientData) {
    if (patientData.insuranceInformation.state !== "active") {
      throw new Error("Inactive insurance subscription!");
    }
  }

  _writeConfirmDataPharmacy(prescription, parsedPharmacyData) {
    prescription.state = "confirmed1";
    prescription.pharmacyName = parsedPharmacyData.pharmacyName;
    prescription.phramacyAddress = parsedPharmacyData.phramacyAddress;
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
      if (!medListDB) throw new Error("Medicine is not coverd by insurance!");

      totalCost += parseInt(medicineDB.cost);
    }
    return totalCost;
  }

  async _insuranceCheck(ctx, patientData, prescription) {
    try {
      const totalPrescriptionCost = await this._calculatePrescriptionCost(
        ctx,
        prescription
      );

      if (patientData.balance.remainingBalance < totalPrescriptionCost) {
        throw new Error("Insufficient balance!");
      } else {
        patientData.balance.remainingBalance -= totalPrescriptionCost;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  _writeConfirmDataPatient(prescription) {
    prescription.state = "purchased";
  }

  _getPrescriptionById(prescriptions, prescriptionId) {
    const prescription = prescriptions.find(
      (p) => p.prescriptionID === prescriptionId
    );
    if (!prescription) {
      return new Error("Prescription not found!");
    }
    return prescription;
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
          patientId: patientRecord.id,
        };
        userRecords.push(tempUser);
      }
    }
    return userRecords;
  }

  async _getHomePageData(ctx, MSPID, patientDataParsed) {
    if (MSPID === "MinistryofhealthMSP") {
      const pageData = this._createPatientPageData(patientDataParsed);
      return {
        pageData: pageData,
        userType: "MinistryofhealthMSP",
      };
    } else if (MSPID === "DoctorMSP") {
      return {
        userType: "Doctor",
      };
    } else if (MSPID === "PharmacyMSP") {
      return {
        userType: "Pharmacy",
      };
    } else if (MSPID === "InsuranceMSP") {
      const userData = await this._createInsurancePageData(ctx);
      return {
        userType: "Insurance",
        insuranceName: patientDataParsed.insuranceName,
        userData: userData,
      };
    } else {
      throw new Error("Access Denied!");
    }
  }
}

module.exports = EHRContract;
