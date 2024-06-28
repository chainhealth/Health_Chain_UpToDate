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
        state: "issued",
        issuingDoctor: "Dr. Jones",
        medicines: [
          {
            name: "Aspirin",
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

class MedicalRecords {
  constructor() {
    this.patientRecords = patientRecords;
    this.pharmacyRecords = pharmacyRecords;
    this.doctorRecords = doctorRecords;
    this.insuranceRecords = insuranceRecords;
    this.medicineList = medicineList;
  }

  getPatientRecords() {
    return this.patientRecords;
  }

  getPharmacyRecords() {
    return this.pharmacyRecords;
  }

  getDoctorRecords() {
    return this.doctorRecords;
  }

  getInsuranceRecords() {
    return this.insuranceRecords;
  }

  getMedicineList() {
    return this.medicineList;
  }
}

module.exports = MedicalRecords;
