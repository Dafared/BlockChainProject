// src/mockDatabase/mockCitizenDatabase.js
export const citizenData = [
    { nationalID: '100001', name: 'Alice' },
    { nationalID: '100002', name: 'Bob' },
    { nationalID: '100003', name: 'Cindy' },
    { nationalID: '100004', name: 'David' },
    { nationalID: '100005', name: 'Eric' },
    { nationalID: '100006', name: 'Frank' },
    { nationalID: '100007', name: 'Grace' },
    { nationalID: '100008', name: 'Hannah' },
    { nationalID: '100009', name: 'Ian' },
    { nationalID: '100010', name: 'Jack' },
    { nationalID: '100011', name: 'Kathy' },
    { nationalID: '100012', name: 'Lee' },
    { nationalID: '100013', name: 'Mia' },
    { nationalID: '100014', name: 'Nina' },
    { nationalID: '100015', name: 'Oscar' },
    { nationalID: '100016', name: 'Paul' },
    { nationalID: '100017', name: 'Quinn' },
    { nationalID: '100018', name: 'Rita' },
    { nationalID: '100019', name: 'Sam' },
    { nationalID: '200001', name: 'Trump' },
    { nationalID: '200002', name: 'Biden' },
];

function checkCitizenInfo(nationalID, name) {
    return citizenData.some(entry =>
        entry.nationalID === nationalID && entry.name === name
    );
}
