"use strict";

const stringify = require("json-stringify-deterministic");
const { Contract } = require("fabric-contract-api");
const ClientIdentity = require("fabric-shim").ClientIdentity;

class Ledger extends Contract {
  async writeRecord(ctx, key, record) {
    try {
      await ctx.stub.putState(key, Buffer.from(stringify(record)));
    } catch (error) {
      throw new Error(`Error while writing a record, ${error}`);
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

  // Private method to get MSP ID from the client identity
  getMSPID(ctx) {
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

  async queryRecord(ctx, patientId) {
    try {
      const asset = await this._getRecord(ctx, patientId);
      if (asset instanceof Error) {
        throw new Error(asset);
      }
      if (!asset || asset.length === 0) {
        throw new Error(`The asset with id ${patientId} does not exist`);
      }
      return asset.toString();
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = Ledger;
