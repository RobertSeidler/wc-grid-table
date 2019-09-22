const fs = require('fs');

replacementData_Name1 = ['Microsoft', 'Oracle', 'Sun Microsystems', 'Canonical Foundation', 'Adobe Systems', 'Symantec', 'SAP', 'IBM']
replacementData_Artikelnummer = '1000000000'

fs.readFile('data.json', (err, data) => {
  if(err) console.error(err);
  let json_data = JSON.parse(data);
  // console.log(json_data)
  let replacement_data = json_data.map((value, index) => ({
    Artikelnummer: (() => {
      let new_artikelnummer = (Number.parseInt(replacementData_Artikelnummer) + index).toString()
      new_artikelnummer = new_artikelnummer.substring(0, 2) + Math.floor(Math.random() * 10).toString() + new_artikelnummer.substring(3);
      return new_artikelnummer;
    })(),
    Unternehmen: replacementData_Name1[Math.floor(Math.random() * 8)],
    Einzelpreis: value["Einzelpreis"],
    Rabattsatz: value["Rabattsatz"]
  }))
  console.log(replacement_data)

  fs.writeFile('data.json', JSON.stringify(replacement_data), (err) => {
    if(err) console.error(err)
  })
})
