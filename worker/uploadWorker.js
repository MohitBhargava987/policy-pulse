const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { MongoClient } = require('mongodb');

async function connect() {
    const client = new MongoClient(workerData.MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(workerData.DB_NAME || 'assignment_db');
    return { client, db };
}

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(err));
    });
}

function parseXLSX(filePath) {
    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    return rows;
}

(async () => {
    parentPort.postMessage('worker started');
    const filePath = workerData.filePath;
    let rows = [];
    try {
        console.log(filePath, 'filePathfilePathfilePathfilePath');
        rows = await parseCSV(filePath);

        const { client, db } = await connect();
        const agents = db.collection('agents');
        const users = db.collection('users');
        const accounts = db.collection('accounts');
        const lobs = db.collection('lobs');
        const carriers = db.collection('carriers');
        const policies = db.collection('policies');

        // Mapping keys based on the provided CSV headers
        for (const r of rows) {
            const agentName = (r['agent'] || '').toString().trim() || null;
            const firstName = (r['firstname'] || r['first name'] || '').toString().trim() || null;
            const dob = r['dob'] || null;
            const address = (r['address'] || '').toString().trim() || null;
            const phone = (r['phone'] || '').toString().trim() || null;
            const state = (r['state'] || '').toString().trim() || null;
            const zip = (r['zip'] || '').toString().trim() || null;
            const email = (r['email'] || '').toString().trim() || null;
            const gender = (r['gender'] || '').toString().trim() || null;
            const userType = (r['userType'] || r['user_type'] || '').toString().trim() || null;
            const accountName = (r['account_name'] || '').toString().trim() || null;
            const categoryName = (r['category_name'] || '').toString().trim() || null;
            const companyName = (r['company_name'] || '').toString().trim() || null;
            const policyNumber = (r['policy_number'] || '').toString().trim() || null;
            const policyStart = r['policy_start_date'] || null;
            const policyEnd = r['policy_end_date'] || null;

            // upsert agent
            let agentDoc = null;
            if (agentName) {
                const res = await agents.findOneAndUpdate(
                    { name: agentName },
                    { $set: { name: agentName } },
                    { upsert: true, returnDocument: 'after' }
                );
                agentDoc = res.value || res;
            }

            // upsert user (using email as unique id when available otherwise using firstname+phone fallback)
            const userQuery = email ? { email } : { firstName, phone };
            const userObj = { firstName, address, phone, state, zip, email, gender, userType };
            if (dob) {
                const d = new Date(dob);
                if (!isNaN(d)) userObj.dob = d;
            }
            const userRes = await users.findOneAndUpdate(userQuery, { $set: userObj }, { upsert: true, returnDocument: 'after' });
            const userDoc = userRes.value || userRes;

            // upsert account
            let accountDoc = null;
            if (accountName) {
                const accRes = await accounts.findOneAndUpdate(
                    { accountName },
                    { $set: { accountName, user: userDoc._id } },
                    { upsert: true, returnDocument: 'after' }
                );
                accountDoc = accRes.value || accRes;
            }

            // upsert lob
            let lobDoc = null;
            if (categoryName) {
                const lobRes = await lobs.findOneAndUpdate(
                    { category_name: categoryName },
                    { $set: { category_name: categoryName } },
                    { upsert: true, returnDocument: 'after' }
                );
                lobDoc = lobRes.value || lobRes;
            }

            // upsert carrier
            let carrierDoc = null;
            if (companyName) {
                const carRes = await carriers.findOneAndUpdate(
                    { company_name: companyName },
                    { $set: { company_name: companyName } },
                    { upsert: true, returnDocument: 'after' }
                );
                carrierDoc = carRes.value || carRes;
            }

            // insert/update policy
            const policyDoc = {
                policy_number: policyNumber,
                policy_start_date: policyStart ? new Date(policyStart) : null,
                policy_end_date: policyEnd ? new Date(policyEnd) : null,
                policy_category_id: lobDoc ? lobDoc._id : null,
                company_id: carrierDoc ? carrierDoc._id : null,
                user_id: userDoc ? userDoc._id : null,
                agent_id: agentDoc ? agentDoc._id : null,
                account_id: accountDoc ? accountDoc._id : null
            };
            if (policyNumber) {
                await policies.updateOne({ policy_number: policyNumber }, { $set: policyDoc }, { upsert: true });
            } else {
                await policies.insertOne(policyDoc);
            }
        }

        await client.close();
        parentPort.postMessage('insert complete');
    } catch (err) {
        parentPort.postMessage({ error: err.message });
    }
})();
