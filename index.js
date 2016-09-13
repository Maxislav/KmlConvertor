/**
 * Created by maxim on 8/25/16.
 */

"use strict";
let parseString = require('xml2js').parseString;
let builder = require('xmlbuilder');

let fs = require('fs');
let TRACK = [];


readFile('history-2016-09-13.kml.xml')
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
    .then(track=> {
        return xmlBuild(track)
    });


function xmlBuild(track) {
    var xml = builder.create('gpx');

    xml.att('xmlns', 'http://www.topografix.com/GPX/1/0');
    xml.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    xml.att('version', '1.0');
    xml.att('creator', 'Google time-line');

    xml.ele('time', {}, new Date().toISOString());
    //

    let trkseg = xml.ele('trk').ele('trkseg');

    fillXmlData(trkseg, track);
    trkseg.end({pretty: true});

    fs.writeFile('message.xml', xml, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });
    //console.log(xml);
}

function fillXmlData(trkseg, track) {

    track.forEach(item=> {
        let trkpt = trkseg.ele('trkpt', {
            'lat': item.lat,
            lon: item.lng
        });
        trkpt.ele('time', {}, item.timeStamp.toISOString());
        trkpt.ele('src', {}, 'network')
    })


}

function getTime(date) {

    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + "T" +
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + 'Z'
}


function fillTrack(places) {
    places.forEach(place=> {
        splitLatLngs(place.latLngs, place.timeStart, place.timeEnd)
    });
    return TRACK
}

function splitLatLngs(latLngs, timeStart, timeEnd) {
    let timeStartLong = new Date(timeStart).getTime();
    let timeEndLong = new Date(timeEnd).getTime();


    if (latLngs.length == 1) {
        let latLngsArr = latLngs[0].split(/\s/);
        TRACK.push({
            lng: latLngsArr[0],
            lat: latLngsArr[1],
            timeStamp: new Date(timeStart)
        })
    } else {
        let stepTime = (timeEndLong - timeStartLong) / latLngs.length;
        let k = 0;
        latLngs.forEach(latLng=> {
            let latLngsArr = latLng.split(/\s/);
            TRACK.push({
                lng: latLngsArr[0],
                lat: latLngsArr[1],
                timeStamp: new Date(timeStartLong + (k * stepTime))

            })
            k++;

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
        console.log(place.name[0]);
        if(place.name[0]=='Cycling'){
            places.push({
                latLngs: place['gx:Track'][0]['gx:coord'],
                timeStart: place.TimeSpan[0].begin[0],
                timeEnd: place.TimeSpan[0].end[0]
            })
        }

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

