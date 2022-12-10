import {api, wire, LightningElement } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';  
import USER_NAME_FIELD from '@salesforce/schema/User.Name';
import USER_PHOTO_URL_FIELD from '@salesforce/schema/User.SmallPhotoUrl';

export default class TttUserInfo extends LightningElement {
    @api userId; 
    @api isGameWon;
    
    @wire(getRecord, { recordId: '$userId', fields: [USER_NAME_FIELD, USER_PHOTO_URL_FIELD ] })
    record;

    get name() {
        if(!this.record.data) return null;
        return this.record.data.fields.Name.value;
    }

    get photoUrl() {
        if(!this.record.data) return null;
        return this.record.data.fields.SmallPhotoUrl.value;
    }
}