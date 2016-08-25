/**
 * Created by maxim on 8/25/16.
 */

"use strict";
var parseString = require('xml2js').parseString;

let fs = require('fs');
let TRACK = [];


readFile('history-2016-08-25.kml.xml')
    .then((xmlStr)=> {
        return toJson(xmlStr)
    })
    .then((json)=> {
        //console.log(json)
        return getPlacemark(json);
    })
    .then((placeMark)=> {
        return getPlaces(placeMark)
    })
    .then(places=> {

        return fillTrack(places)
    })


function fillTrack(places) {
    places.forEach(place=> {
        splitLatLngs(place.latLngs, place.timeStart, place.timeEnd)
    })


}

function splitLatLngs(latLngs, timeStart, timeEnd) {
    let timeStartLong = new Date(timeStart).getTime();
    let timeEndLong = new Date(timeEnd).getTime();


    if(latLngs.length == 1){
        let latLngsArr = latLngs[0].split(/\s/);
        TRACK.push({
            lat: latLngsArr[0],
            lng: latLngsArr[1],
            timeStamp: new Date(timeStart)
        })
    }else {
        let stepTime = (timeEndLong - timeStartLong)/latLngs.length;
        let k = 0;
        latLngs.forEach(latLng=>{
            let latLngsArr = latLng.split(/\s/);
            TRACK.push({
                lat: latLngsArr[0],
                lng: latLngsArr[1],
                timeStamp:new Date(timeStartLong+(k*stepTime))
            })

        })
    }
    return TRACK;

}


/**
 *
 * @param {Array}placeMark
 * @returns {Array}
 */
function getPlaces(placeMark) {
    let places = [];
    placeMark.forEach(place=> {
        places.push({
            latLngs: place['gx:Track'][0]['gx:coord'],
            timeStart: place.TimeSpan[0].begin[0],
            timeEnd: place.TimeSpan[0].end[0]
        })
    });
    return places
}

function getPlacemark(json) {
    return new Promise((res, rej)=> {
        let placeMark
        try {
            placeMark = json.kml.Document[0].Placemark;
        } catch (err) {
            console.error(err)
        }

        res(placeMark);
    })
}


/**
 *
 * @param {String} str
 * @returns {Promise}
 */
function toJson(xml) {
    return new Promise((resolve, reject)=> {
        parseString(xml, function (err, result) {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
            // console.dir(JSON.stringify(result));
        });
    })
}


/**
 *
 * @param {String} path
 * @returns {Promise}
 */
function readFile(path) {
    return new Promise((resolve, reject)=> {

        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(data.toString())
        });
    })

}

