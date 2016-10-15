import { Injectable } from '@angular/core';
import {Platform, SqlStorage, Storage, ModalController} from "ionic-angular";
import {SignUpPage} from "../pages/home/signup/signup";



@Injectable()
export class SqlStorageService {

  DB: Storage = null;
  profile;

  constructor(private platform: Platform, private modalCtrl: ModalController) {
    this.DB = new Storage(SqlStorage);
    let whichPlat = platform.platforms();
    console.log(whichPlat);
    this.profile = document.getElementsByClassName("homemain-page");

    //CREATE THE FOOD TABLE
    this.DB.query('CREATE TABLE IF NOT EXISTS food_table (id INTEGER PRIMARY KEY AUTOINCREMENT, saved_food TEXT, scanned_food TEXT, barcode_id TEXT, food_notes TEXT, name_of_creator TEXT, profile_pic TEXT, scanned_date TEXT, food_order TEXT, food_title TEXT)').then(
      result => {
        console.log(result);
        console.log("Created Table food_table Successfully");
      }, err => {
        console.log("Failed Making Table food_table");
        console.log(err);
      }
    );

    //CREATE THE DRAFT TABLE
  this.DB.query('CREATE TABLE IF NOT EXISTS draft_table (id INTEGER PRIMARY KEY AUTOINCREMENT, food_name TEXT, food_url TEXT, food_amount TEXT)').then(
      result => {
        console.log(result);
        console.log("Created Table draft_table Successfully");
      }, err => {
        console.log("Failed Making Table draft_table");
        console.log(err);
      }
    );

    //CREATE THE PROFILE TABLE
  this.DB.query('CREATE TABLE IF NOT EXISTS profile_table (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, profile_pic TEXT)').then(
      result => {
        console.log(result);
        console.log("Created Table profile_table Successfully");
        if(result.res.rows.length === 0){
          console.log("User does not have an account with us");
          let modal = this.modalCtrl.create(SignUpPage);
          modal.onDidDismiss(() => {
            this.BackgroundOpacity(true);
          });
          this.BackgroundOpacity(false);
          modal.present();
        }

      }, err => {
        console.log("Failed Making Table profile_table");
        console.log(err);
      }
    );
  }

  //THIS FUNCTION IS TO CHANGE THE BACKGROUND OF THE MAIN PAGE TO BLUR AND BLACK
  //THIS ONLY COMES UP WHEN THE USER FIRST LOGGED INTO THE APP
  BackgroundOpacity(value){
    if(value){
      this.profile[0].setAttribute("style", "background-color: '';");
    }else{
      this.profile[0].setAttribute("style", "opacity: 0.5;background-color: #363838;-webkit-filter: blur(5px);moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);");
    }
  }



  DeleteAllTable(){
      this.DB.query(`DROP TABLE IF EXISTS food_table`).then(
        (data) => {
          console.log("Deleted food_table Sucess!");
        }, (err) => {
          console.log("ERROR DELETING food_table!");
          console.log(err);
        }
      );
      this.DB.query(`DROP TABLE IF EXISTS profile_table`).then(
        (data) => {
          console.log("Deleted profile_table success!!!");
        }, (err) => {
          console.log("ERROR DELETING profile_table");
          console.log(err);
        }
      );
      return this.DB.query(`DROP TABLE IF EXISTS draft_table`);
  }

  AddFakeData(){
      return this.DB.query(`INSERT INTO food_table (saved_food, scanned_food, barcode_id, food_notes, name_of_creator,profile_pic, scanned_date, food_order, food_title) VALUES (?,?,?,?,?,?,?,?,?)`, ['true', 'true', '234865742', 'Put cheese on the bread', 'Victor', 'male1', '123123131','this is the stringify order', 'Monday Meal']);

    // return this.DB.query(`INSERT INTO profile_table (name, profile_pic) VALUES (?,?)`, ["bob", "male2"]);

  }

  //GRAB ALL TABLE AND PLACE THEM INTO AN OBJECT
  RetreiveAllTable(callback){
      let allTable = {
        food_table: [],
         profile_table: [],
        draft_table: []
      };
      this.DB.query(`SELECT * FROM food_table`).then(
        (data) => {
          console.log(data.res.rows.length);
          for(let i = 0; i < data.res.rows.length; i++){
            allTable.food_table.push(data.res.rows.item(i))
          };

          this.DB.query(`SELECT * FROM draft_table`).then(
            (data) => {
              for(let i = 0; i < data.res.rows.length; i++){
                allTable.draft_table.push(data.res.rows.item(i))
              };

              this.DB.query(`SELECT * FROM profile_table`).then(
                (data) => {
                  console.log("grabbed Everything successfully!");
                  for(let i = 0; i < data.res.rows.length; i++){
                    allTable.profile_table.push(data.res.rows.item(i))
                  };
                  callback(allTable);
                }, (err) => {
                  console.log("Failed to grab profile_table");
                  console.log(err);
                  callback(err);
                }
              );

            }, (err) => {
              console.log("Failed to grab draft_table");
              console.log(err);
              callback(err);
            }
          );
        }, (err) => {
          console.log("Failed to grab food_table");
          console.log(err);
          callback(err);
        }
      );
  }



  /* Beginning
  *
  *
  * EVERYTHING IN HERE WILL ASSOCIATE WITH THE DRAFT TABLE
  *
  *
  * */

  public AddItemToDraft(item){
    let sql = `INSERT INTO draft_table (food_name, food_url, food_amount) VALUES (?,?,?)`;
    this.DB.query(sql , [item.name, item.url, item.amount]);
  }

  public ResetEverythingInDraft(callback){
    this.DB.query(`DROP TABLE IF EXISTS draft_table`).then(
      (data) => {
        console.log("Sucess deleting everything in draft!");
        this.DB.query('CREATE TABLE IF NOT EXISTS draft_table (id INTEGER PRIMARY KEY AUTOINCREMENT, food_name TEXT, food_url TEXT, food_amount TEXT)').then(
          result => {
            console.log("Created Table draft_table Successfully");
            callback(true);
          }, err => {
            console.log("Failed Making Table draft_table");
            console.log(err);
            callback(false);
          }
        );
      }, (err) => {
        console.log("ERROR DELETING food_table!");
        callback(false);
        console.log(err);
      }
    );
  }

  public UpdateIndividualDraftItem(item_index, callback){
    let sql = `SELECT * FROM draft_table`;
    this.DB.query(sql, []).then(
      (data) => {
        let obj = [];

        for(let i = 0; i < data.res.rows.length; i++){
          obj.push(data.res.rows.item(i));
          if(i === (data.res.rows.length-1)){
            console.log("This is the last iteration");
            obj.splice(item_index, 1);
            for(let a = 0; a < obj.length; a++ ){
              let sql2 = `INSERT INTO draft_table (food_name, food_url, food_amount) VALUES (?,?,?)`;
              this.DB.query(sql2, [obj[a].food_name, obj[a].food_url, obj[a].food_amount]);
              if(a === (obj.length -1)){
                callback(true);
              };
            };
          }
        };
      }, (err) => {
        console.log("There was an error selecting the draft_table");
        console.log(err);
        callback(false);
      }
    );
  }

  public DeleteIndividualDraft(item_index, callback){
    let sql = `SELECT * FROM draft_table`;
    this.DB.query(sql, []).then(
      (data) => {
        let obj = [];

        for(let i = 0; i < data.res.rows.length; i++){
          obj.push(data.res.rows.item(i));
          if(i === (data.res.rows.length-1)){
            console.log("This is the last iteration");
            obj.splice(item_index, 1);
            for(let a = 0; a < obj.length; a++ ){
              let sql2 = `INSERT INTO draft_table (food_name, food_url, food_amount) VALUES (?,?,?)`;
              this.DB.query(sql2, [obj[a].food_name, obj[a].food_url, obj[a].food_amount]);
              if(a === (obj.length -1)){
                callback(true);
              };
            };
          }
        };
      }, (err) => {
        console.log("There was an error selecting the draft_table");
        console.log(err);
        callback(false);
      }
    );
  }

  public SendOffDraft(){

  }





}














































