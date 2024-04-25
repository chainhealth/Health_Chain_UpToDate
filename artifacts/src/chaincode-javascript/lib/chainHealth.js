"use strict";

const stringify = require("json-stringify-deterministic");
const { Contract } = require("fabric-contract-api");
const ClientIdentity = require("fabric-shim").ClientIdentity;

const lastIdPatientKey = "patientIdCounter";
const lastIdDoctorKey = "doctorIdCounter";
const lastIdPharmacyKey = "pharmacyIdCounter";
const lastIdInsurancekey = "insuranceIdCounter";

class EHRContract extends Contract {
  // Initialization method for ledger data
  async InitLedger(ctx) {
    try {
      for (const patientRecord of patientRecords) {
        // Storing patient record in the ledger
        await ctx.stub.putState(
          patientRecord.patientID,
          Buffer.from(stringify(patientRecord))
        );
      }
      // Storing pharmacy record in the ledger
      for (const pharmacyRecord of pharmacyRecords) {
        // Storing patient record in the ledger
        await ctx.stub.putState(
          pharmacyRecord.pharmacyId,
          Buffer.from(stringify(pharmacyRecord))
        );
      }
      const patientLength = patientRecords.length.toString();
      const pharmacyLength = pharmacyRecords.length.toString();
      const doctorLength = doctorRecords.length.toString();
      const insuranceLength = doctorRecords.length.toString();

      const patientCounterId = {
        name: lastIdPatientKey,
        lastId: patientLength,
      };
      const pharmacyCounterId = {
        name: lastIdPatientKey,
        lastId: pharmacyLength,
      };
      const doctorCounterId = {
        name: lastIdPatientKey,
        lastId: doctorLength,
      };
      const insuranceCounterId = {
        name: lastIdPatientKey,
        lastId: insuranceLength,
      };
      await ctx.stub.putState(lastIdPatientKey, stringify(patientCounterId));
      await ctx.stub.putState(lastIdPharmacyKey, stringify(pharmacyCounterId));
      await ctx.stub.putState(lastIdDoctorKey, stringify(doctorCounterId));
      await ctx.stub.putState(
        lastIdInsurancekey,
        stringify(insuranceCounterId)
      );

      return "Successfully initialized the ledger";
    } catch (err) {
      throw new Error(`${"Error while initializing the ledger!"}: ${err}`);
    }
  }

  // TODO: must be deleted
  // Method to retrieve all records from the ledger
  async getAllRecords(ctx) {
    try {
      // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
      const iterator = await ctx.stub.getStateByRange("", "");
      const recordData = await this._getIteratorData(iterator);
      const mspID = this._getMSPID(ctx);
      return `${recordData} ${mspID}`;
    } catch (error) {
      throw new Error("Can't get all records!");
    }
  }

  // Private method to convert iterator data to JSON
  async _getIteratorData(iterator) {
    const allRecords = [];
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      const record = this._changeToJSON(strValue);
      allRecords.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allRecords);
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

  // Private method to get MSP ID from the client identity
  _getMSPID(ctx) {
    const clientIdentity = new ClientIdentity(ctx.stub);
    const clientMSP = clientIdentity.getMSPID();
    return clientMSP;
  }

  // Private method to retrieve a specific record
  async _getRecord(ctx, patientId) {
    try {
      const asset = await ctx.stub.getState(patientId);
      return asset;
    } catch (err) {
      throw new Error("Error getting the requested record!");
    }
  }

  // Method to query a specific record
  async _queryRecord(ctx, patientId) {
    const asset = await this._getRecord(ctx, patientId);
    if (asset instanceof Error) {
      return asset;
    }
    if (!asset || asset.length === 0) {
      throw new Error(`The asset with id ${patientId} does not exist`);
    }
    return asset.toString();
  }

  // Method to check patient by id
  async getPatientInfo(ctx, patientId) {
    const patientData = await this._queryRecord(ctx, patientId);
    // If patient is not found
    if (patientData instanceof Error) {
      return patientData;
    }

    // Parse the patient data
    const parsedData = this._changeToJSON(patientData);

    const clientMSP = this._getMSPID(ctx);

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
      throw new Error("You don't have access to this record!");
    }
  }

  // Return the desired pharmacy information
  async getPharmacyInfo(ctx, pharmacyId) {
    const pharmacyData = await this._queryRecord(ctx, pharmacyId);
    // If pharmacy is not found
    if (pharmacyData instanceof Error) {
      return pharmacyData;
    }

    // Parse the patient data
    const parsedData = this._changeToJSON(pharmacyData);

    const clientMSP = this._getMSPID(ctx);

    if (clientMSP === "MinistryofhealthMSP") {
      return {
        pharmacyName: parsedData.pharmacyName,
        pharmacyAddress: parsedData.phramacyAddress,
      };
    } else {
      throw new Error("You don't hace access to this record");
    }
  }

  // Private method to create an array from prescription string
  _createPrescriptionArray(prescription) {
    const prescriptionArray = prescription.split(",");
    return prescriptionArray;
  }

  // Private method to update patient prescription
  async _updatePrescription(ctx, patientDataJSON, issuingDoctor, prescription) {
    try {
      // Calulate the prescriptionId
      const prescriptionId = `pres${patientDataJSON.prescription.length + 1}`;

      const prescriptionArray = this._createPrescriptionArray(prescription);
      const prescriptionObject = {
        prescriptionID: prescriptionId,
        state: "issued",
        issuingDoctor: issuingDoctor,
        medicines: prescriptionArray,
      };
      patientDataJSON.prescription.push(prescriptionObject);
      patientDataJSON.medicalHistory.medications = prescriptionArray;
      await ctx.stub.putState(
        patientDataJSON.patientID,
        Buffer.from(stringify(patientDataJSON))
      );
    } catch (error) {
      return error;
    }
  }

  // Method to write patient prescription, with access control
  async writePatientPrescription(ctx, patientId, issuingDoctor, prescription) {
    const clientMSP = this._getMSPID(ctx);
    if (clientMSP !== "DoctorMSP") {
      throw new Error("You don't have the privilege to write prescriptions!");
    }

    const patientData = await this._queryRecord(ctx, patientId);
    console.log(patientData);
    // If patient is not found
    if (patientData instanceof Error) {
      return patientData;
    }

    // Parse Patient Data
    const parsedData = this._changeToJSON(patientData);

    try {
      await this._updatePrescription(
        ctx,
        parsedData,
        issuingDoctor,
        prescription
      );
      return "Updated the prescription seccessfully!";
    } catch (error) {
      throw new Error(
        "Error occurred while updating the patient prescription!"
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

  _modifyPrescription(prescription, parsedPharmacyData, clientMSP) {
    prescription.state =
      clientMSP === "PharmacyMSP" ? "confirmed1" : "confirmed2";
    prescription.pharmacyName = parsedPharmacyData.pharmacyName;
    prescription.phramacyAddress = parsedPharmacyData.phramacyAddress;
  }

  // Method for pharmacy to confirm sale of prescription
  async confirmPrescriptionSalePharmacy(ctx, patientId, pharmacyId, presId) {
    const patientData = await this._queryRecord(ctx, patientId);
    if (patientData instanceof Error) {
      return patientData;
    }

    const pharmacyData = await this._queryRecord(ctx, pharmacyId);
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
      return prescription;
    }

    const clientMSP = this._getMSPID(ctx);
    if (clientMSP !== "PharmacyMSP" && clientMSP !== "MinistryofhealthMSP") {
      throw new Error("Access Denied!");
    }
    if (clientMSP === "PharmacyMSP" && prescription.state !== "issued") {
      return "Prescription already confirmed by a pharmacy!";
    } else if (
      clientMSP === "MinistryofhealthMSP" &&
      prescription.state !== "confirmed1"
    ) {
      return "Prescription must be confirmed by a pharmacy first!";
    }

    // TODO: Insurance Check
    this._modifyPrescription(prescription, parsedPharmacyData, clientMSP);

    try {
      await ctx.stub.putState(
        parsedPatientData.patientID,
        Buffer.from(stringify(parsedPatientData))
      );
      return "Confirmed the prescription successfully!";
    } catch (error) {
      throw new Error("Error occurred while confirming patient prescription!");
    }
  }

  async _getAndIncIdCounter(ctx, counterKey) {
    try {
      let counterData = await ctx.stub.getState(counterKey);
      let parsedCounterData = this._changeToJSON(counterData);
      let counterValue = parseInt(parsedCounterData.lastId);

      counterValue++;
      parsedCounterData.lastId = counterValue.toString();

      await ctx.stub.putState(
        counterKey,
        Buffer.from(stringify(parsedCounterData))
      );

      return counterValue;
    } catch (error) {
      throw new Error(`Error while incrementing id! ${error}`);
    }
  }

  _getUserKey(userType) {
    if (userType === "patient") return lastIdPatientKey;
    else if (userType === "pharmacy") return lastIdPharmacyKey;
    else if (userType === "doctor") return lastIdDoctorKey;
    else if (userType === "insurance") return lastIdInsurancekey;
    else return new Error("Invalid user type entered!");
  }

  async _addRecordToLedger(ctx, recordId, recordData) {
    try {
      await ctx.stub.putState(recordId, Buffer.from(stringify(recordData)));
    } catch (error) {
      throw new Error(`Error writing to ledger ${error}`);
    }
  }

  async addUser(ctx, recordData, userType) {
    if (!recordData) {
      return "Must Enter recordData";
    }

    const userKey = this._getUserKey(userType);
    if (userKey instanceof Error) return userKey;

    const newRecordId = await this._getAndIncIdCounter(ctx, userKey);
    if (newRecordId instanceof Error) return newRecordId;

    try {
      const newId = `${userType}${newRecordId}`;
      const tempObject = { recordId: newId, something: `Something ${newId}` };
      await this._addRecordToLedger(ctx, newId, tempObject);
      return "Successfully added new user!";
    } catch (error) {
      return "Error adding new record";
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
