// const admin = require("firebase-admin");
// const serviceAccount = require("./config/new-serviceAccountKey.json");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// const seed = async () => {
//   const business = {
//     contactNumber: "0711035654",
//     contactPerson: "Sibaa",
//     description: "Your one-stop shop for customized printed aprons, umbrellas, towels and beautifully crafted invitation cards.",
//     email: "mvubusiba@gmail.com",
//     facebook: "https://web.facebook.com/?_rdc=2&_rdr#",
//     imageUrl: "/uploads/sibaLogo.png",
//     industry: "Arts and Culture",
//     location: "Ndwedwe",
//     name: "Sibahle Accessories",
//     productImages: [
//       "/uploads/umbrella.jpg",
//       "/uploads/apron.jpg",
//       "/uploads/mug.png"
//     ],
//     products: "Personalized aprons , Personalized umbrellas , Personalized mugs , Invitation cards"
//   };

//   try {
//     const docRef = await db.collection("businesses").add(business);
//     console.log(`Business inserted with ID: ${docRef.id}`);
//   } catch (err) {
//     console.error("Failed to insert business:", err);
//   }
// };

// seed();
const admin = require("firebase-admin");
const serviceAccount = require("./config/new-serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

const seedEvent = async () => {
  const event = {
    title: "Monetise Your Business - UMlazi",
    description: "Dynamic workshops designed to empower township entrepreneurs in South Africa.",
    date: admin.firestore.Timestamp.fromDate(new Date("2025-06-21T08:00:33Z")), // UTC time
    imageUrl: "/uploads/umbrella.jpg",
    link: "https://landing.mailerlite.com/webforms/landing/d4c9e3",
    location: "EMlazi",
    price: "Free"
  };

  try {
    const docRef = await db.collection("events").add(event);
    console.log(`Event inserted with ID: ${docRef.id}`);
  } catch (err) {
    console.error("Failed to insert event:", err);
  }
};

seedEvent();
