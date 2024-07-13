"use strict";

const stringify = require("json-stringify-deterministic");
const { Contract } = require("fabric-contract-api");
const ClientIdentity = require("fabric-shim").ClientIdentity;

class Ledger extends Contract {
  /**
   * Writes a record to the ledger.
   * @param {Context} ctx The transaction context
   * @param {string} key The key under which to store the record
   * @param {object} record The record to store
   * @throws {Error} If an error occurs while writing the record
   */
  async writeRecord(ctx, key, record) {
    try {
      await ctx.stub.putState(key, Buffer.from(stringify(record)));
    } catch (error) {
      throw new Error(`Error while writing a record, ${error}`);
    }
  }

  /**
   * Retrievs all methods in the database
   * @param {Context} ctx The transaction context
   * @returns {string} All records
   * @throws {Error} If the records cannot be retrieved
   */
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

  /**
   * Get MSPID
   * @param {Context} ctx The transaction context
   * @returns {string} The record MSPID
   */
  getMSPID(ctx) {
    const clientIdentity = new ClientIdentity(ctx.stub);
    const clientMSP = clientIdentity.getMSPID();
    return clientMSP;
  }

  /**
   * Retrieves a specific record from the ledger.
   * @param {Context} ctx The transaction context
   * @param {string} patientId The ID of the patient record to retrieve
   * @returns {string} The JSON string representation of the record
   * @throws {Error} If the record cannot be retrieved
   */
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

  // Private method to retrieve a specific record
  async _getRecord(ctx, patientId) {
    try {
      const asset = await ctx.stub.getState(patientId);
      return asset;
    } catch (err) {
      throw new Error("Error getting the requested record!");
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
      const record = JSON.parse(strValue);
      allRecords.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allRecords);
  }
}

module.exports = Ledger;
