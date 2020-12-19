
const fs = require('fs');

/*
Author: Alexander Sedore
Date: 12/19/2020
Version: 0.1
Stripping a given JSON of all non SRD content and exporting the object for future use.
*/

let user = JSON.parse(fs.readFileSync('races.json'));
let srdRaces = [];
let raceCount = 0;

for (let i in user.race) {
    if (user.race[i].srd == true) {
        srdRaces.push(user.race[i]);
        if (user.race[i].subraces){
            for (let x = 0; x < user.race[i].subraces.length; x++){
                if (user.race[i].subraces[x].srd != true){
                    let removed = srdRaces[raceCount].subraces.splice(x, 1);
                    x --;
                }
            }
        }
        raceCount ++;
    } 
}

module.exports.srdRaces = srdRaces;

//how to focus on the JSon race section

/*
var name = user.race[0].name; //getting the races name
var size =  user.race[0].size;
var ability = user.race[0].ability[0];

var raceFeatures = user.race[0].entries;
var subRace = user.race[0].subraces;

var subRaceSpeed = subRace[0].speed;
var darkVision = subRace[0].darkvision;
var str = 0;
var con = 0;
var int = 0;
var dex = 0;
var wiz = 0;
var char = 0;

console.log(subRaceSpeed);
console.log(darkVision);

// Adding ability score increases for base race
str += ability.str == undefined ? 0 : ability.str;
con += ability.con == undefined ? 0 : ability.con;
dex += ability.dex == undefined ? 0 : ability.dex;
int += ability.int == undefined ? 0 : ability.int;
char += ability.char == undefined ? 0 : ability.char;
wiz += ability.wiz == undefined ? 0 : ability.wiz;

console.log(subRace);
*/

