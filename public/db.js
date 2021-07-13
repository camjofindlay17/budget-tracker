let db

const request = window.indexedDB.open("BudgetStore", 1)

request.onupgradeneeded = async (event) => {
    db = event.target.result;
  
    const Budget = await db.createObjectStore("BudgetStore", { autoIncrement:true });
};

request.onsuccess = e => {
    db = e.target.result
}

request.onerror = e => {
    console.log(e)
}

function saveRecord(rec) {
    db = request.result

    const transaction = db.transaction("BudgetStore", "readwrite")
    const Budget = transaction.objectStore("BudgetStore")

    Budget.add(rec)
}

function checkRecord() {
    db = request.result
    const transaction = db.transaction("BudgetStore", "readwrite")
    const list = transaction.objectStore("BudgetStore")

    const retrieveAll = list.getAll()

    retrieveAll.onsuccess = function () {
      if (retrieveAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(retieveAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
            },
        })
      .then((data) => data.json())
      .then(() => {
        db.transaction("BudgetStore", "readwrite").objectStore("BudgetStore").clear()
      })
    }
  }
}   

window.addEventListener("online", checkRecord)

