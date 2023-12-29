"use strict";

const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");
const ClientIdentity = require("fabric-shim").ClientIdentity;

class EHRContract extends Contract {
  // Initialization method for ledger data
  async InitLedger(ctx) {
    try {
      for (const patientRecord of patientRecords) {
        // Storing patient record in the ledger
        await ctx.stub.putState(
          patientRecord.patientID,
          Buffer.from(stringify(sortKeysRecursive(patientRecord)))
        );
      }
    } catch (err) {
      throw new Error("Error while initializing the ledger!");
    }
  }

  // Method to retrieve all records from the ledger
  async getAllRecords(ctx) {
    try {
      // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
      const iterator = await ctx.stub.getStateByRange("", "");
      const recordData = await this._getIteratorData(iterator);
      return recordData;
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

  // Private method to retrieve a specific record
  async _getRecord(ctx, recordNumber) {
    try {
      const recordID = `PATIENT${recordNumber}`;
      const asset = await ctx.stub.getState(recordID);
      return asset;
    } catch (err) {
      throw new Error("Error getting the requested record!");
    }
  }

  // Method to query a specific record
  async queryRecord(ctx, recordNumber) {
    const asset = await this._getRecord(ctx, recordNumber);
    if (asset instanceof Error) {
      return asset;
    }
    if (!asset || asset.length === 0) {
      throw new Error(`The asset with id ${recordNumber} does not exist`);
    }
    return asset.toString();
  }

  // Private method to get MSP ID from the client identity
  _getMSPID(ctx) {
    const clientIdentity = new ClientIdentity(ctx.stub);
    const clientMSP = clientIdentity.getMSPID();
    return clientMSP;
  }

  // Private method to retrieve patient record data based on personal information
  async _getPatientRecordData(ctx, firstName, lastName, email) {
    let queryString = {};
    queryString.selector = {
      "personalInformation.firstName": firstName,
      "personalInformation.lastName": lastName,
      "personalInformation.contactInformation.email": email,
    };
    let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    const patientRecord = await this._getIteratorData(iterator);
    const patientRecordJSON = this._changeToJSON(patientRecord)[0];
    return patientRecordJSON;
  }

  // Method to get patient record based on personal information, with access control
  async getPatientRecord(ctx, firstName, lastName, email) {
    const clientMSP = this._getMSPID(ctx);
    const patientDataJSON = await this._getPatientRecordData(
      ctx,
      firstName,
      lastName,
      email
    );
    if (!patientDataJSON) {
      throw new Error("No Record for this patient!");
    }

    // Access control based on MSP ID
    if (clientMSP === "InsuranceMSP") {
      const patientInsuranceInformation = patientDataJSON.insuranceInformation;
      return JSON.stringify(patientInsuranceInformation);
    } else if (clientMSP === "PharmacyMSP") {
      const patientMedication = patientDataJSON.medicalHistory.medications;
      return JSON.stringify(patientMedication);
    } else if (clientMSP === "PatientMSP") {
      return JSON.stringify(patientDataJSON);
    } else {
      throw new Error("You don't have access to this record!");
    }
  }

  // Method to read patient prescription
  async readPatientPrescription(ctx, firstName, lastName, email) {
    const patientDataJSON = await this._getPatientRecordData(
      ctx,
      firstName,
      lastName,
      email
    );

    if (!patientDataJSON) {
      throw new Error("No Record for this patient!");
    }
    if (!patientDataJSON.prescription) {
      throw new Error("This patient doesn't have any current prescription!");
    }
    return JSON.stringify(patientDataJSON.prescription);
  }

  // Private method to create an array from prescription string
  _createPrescriptionArray(prescription) {
    const prescriptionArray = prescription.split(",");
    return prescriptionArray;
  }

  // Private method to update patient prescription
  async _updatePrescription(ctx, patientDataJSON, prescription) {
    try {
      const prescriptionArray = this._createPrescriptionArray(prescription);
      patientDataJSON.prescription = prescriptionArray;
      await ctx.stub.putState(
        patientDataJSON.patientID,
        Buffer.from(stringify(sortKeysRecursive(patientDataJSON)))
      );
    } catch (error) {
      return error;
    }
  }

  // Method to write patient prescription, with access control
  async writePatientPrescription(
    ctx,
    firstName,
    lastName,
    email,
    prescription
  ) {
    const clientMSP = this._getMSPID(ctx);
    if (clientMSP !== "InsuranceMSP") {
      throw new Error("You don't have the privilege to write prescriptions!");
    }

    const patientDataJSON = await this._getPatientRecordData(
      ctx,
      firstName,
      lastName,
      email
    );
    if (!patientDataJSON) {
      throw new Error("No Record for this patient!");
    }

    try {
      await this._updatePrescription(ctx, patientDataJSON, prescription);
      return "Updated the prescription successfully!";
    } catch (error) {
      throw new Error("Error while updating the prescription!");
    }
  }
}

// Exporting the EHRContract class
module.exports = EHRContract;

// Sample patient records for ledger initialization
const patientRecords = [
  {
    patientID: "PATIENT1",
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
      policyNumber: "INS123456",
    },
    prescription: [],
  },
  {
    patientID: "PATIENT2",
    personalInformation: {
      firstName: "Mina",
      lastName: "Saad",
      dateOfBirth: "1990-01-01",
      gender: "Male",
      contactInformation: {
        address: "123 Main St",
        city: "Anytown",
        state: "Anystate",
        country: "AnyCountry",
        postalCode: "12345",
        phoneNumber: "123-456-7890",
        email: "mina@gmail.com",
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
      policyNumber: "INS123456",
    },
    prescription: [],
  },
];
