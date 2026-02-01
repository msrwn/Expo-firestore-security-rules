// firestore.rules.test.js
const fs = require("fs");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "expofirestoreruledemo",
    firestore: {
      rules: fs.readFileSync("./firestore.rules", "utf8"),
    },
  });

  // Seed users (security rules disabled)
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection("users").doc("member1").set({
      role: "member",
      org: "org1",
    });

    await db.collection("users").doc("admin1").set({
      role: "admin",
      org: null,
    });
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore rules", () => {

  test("Member can write message to their own org", async () => {
    const db = testEnv.authenticatedContext("member1").firestore();

    await assertSucceeds(
      db.collection("messages").add({
        text: "Hello org1",
        senderId: "member1",
        org: "org1",
        timestamp: Date.now(),
      })
    );
  });

  test("Member cannot write message to another org", async () => {
    const db = testEnv.authenticatedContext("member1").firestore();

    await assertFails(
      db.collection("messages").add({
        text: "Attack org2",
        senderId: "member1",
        org: "org2",
        timestamp: Date.now(),
      })
    );
  });

  test("Admin can write to any org but cannot spoof senderId", async () => {
    const db = testEnv.authenticatedContext("admin1").firestore();

    await assertSucceeds(
      db.collection("messages").add({
        text: "Admin message",
        senderId: "admin1",
        org: "org2",
        timestamp: Date.now(),
      })
    );

    await assertFails(
      db.collection("messages").add({
        text: "Impersonation attempt",
        senderId: "member1",
        org: "org1",
        timestamp: Date.now(),
      })
    );
  });


  test("Deleted / ghost user cannot read or write", async () => {
    const ghostDb = testEnv.authenticatedContext("ghostUser").firestore();

    await assertFails(
      ghostDb.collection("messages").add({
        text: "Ghost message",
        senderId: "ghostUser",
        org: "org1",
        timestamp: Date.now(),
      })
    );
  });

});
