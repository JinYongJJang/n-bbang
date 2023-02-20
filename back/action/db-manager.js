const xml2js = require('xml2js')
const fs = require('fs')
const path = require('path')
const fileDir = path.resolve(__dirname, '../db_ref/query.xml')
const query = fs.readFileSync(fileDir, "utf-8")
const parser = new xml2js.Parser({trim: true, explicitArray: false});
const getConnection = require('../db_ref/db');
var querySet;

class executeQuery {
    constructor() {
        console.log(`======================${fileDir}`)
        this.setQuerySet();
    }
    static async execute(requiredOpt) {
        var queryId = requiredOpt.queryId;
        var values = requiredOpt.values;

        var query = querySet[queryId];
        //var isTot = requiredOpt.isTotal == null? false: requiredOpt.isTotal;
        /* // select 일 경우 page limit 추가
        if (!isTot && query.toLowerCase().indexOf("select") == 0) {
            let pNo = requiredOpt.currPage;
            let sPage = pNo;
        } */
        //console.log(query);
        //console.log(values);
        let retObj;
        try {
            retObj = await new Promise(resolve => {
                getConnection(async function(connObj) {
                    let retObj = await new Promise(resolve => {
                        let subObj = new Object();
                        connObj.query(query, values, (err, row) => {
                            if (err) {
                                console.log(err);
                                subObj.isSuccess = false;
                                subObj.data = err;
                            } else {
                                subObj.isSuccess = true;
                                subObj.data = row;
                            }
                            resolve(subObj);
                        });
                        connObj.release();
                    });
                    resolve(retObj);
                })
            });
        } catch (err) {
            retObj = new Object();
            retObj.isSuccess = false;
            retObj.data = err;
            console.log(err);
        }

        return retObj;
    }
    setQuerySet() {
        parser.parseString(query, (err, result) => {
            if(err) {
                retVal = err;
            } else {
                querySet = result.query;
            }
        });
    }
    /* static async getPageNaviNum(requiredOpt) {
        let currPg = requiredOpt.currPage == null? 1:Number(requiredOpt.currPage);
        requiredOpt.isTotal = true;
        let retObj = await this.execute(requiredOpt);
        let totCnt = retObj.data[0].cnt;
        let totPg = 0;
        let sPgNum = 0;
        let ePgNum = sPgNum;
        sPgNum = currPg - sPgNum;
        ePgNum = currPg + ePgNum;
        if (sPgNum == 0) {
            sPgNum = 1;
            ePgNum += 1;
        } else if(sPgNum < 0) {
            ePgNum = ePgNum - sPgNum;
            sPgNum = 1;
        }

        if (ePgNum > totPg) {
            ePgNum = totPg;
        }

        retObj = new Object();
        retObj.sPageNum = sPgNum;
        retObj.ePageNum = ePgNum;
        retObj.tPageNum = totPg;

        return retObj;
    } */
}

module.exports = executeQuery;