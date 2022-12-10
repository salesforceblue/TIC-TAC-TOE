/* 
@Author: Pankaj Agrahari 
@Email: salesforceblue@gmail.com 
*/

trigger TTT_GameLobbyTrigger on TTT_Game_Lobby__c (after insert) {
    TTT_GameLobbyTriggerHandler.afterInsert(Trigger.New, Trigger.newMap);
}