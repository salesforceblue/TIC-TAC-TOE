/* 
@Author: Pankaj Agrahari 
@Email: salesforceblue@gmail.com 
@Desc: Service class for GameLobby 
*/

public with sharing class TTT_GameLobbyService {
    /* @Desc: scheduled for Game Area */
    public static void scheduleGame(List<TTT_Game_Lobby__c> recordList) {
        List<TTT_Game_Lobby__c> existingPlayersInLobby = new List<TTT_Game_Lobby__c>();
        List<TTT_Game_Lobby__c> gameLobbyList = new List<TTT_Game_Lobby__c>();
        List<TTT_Game_Lobby__c> lobbyListAddedToGameArea = new List<TTT_Game_Lobby__c>();
        List<TTT_Game_Area__c> gameAreaList = new List<TTT_Game_Area__c>();

        for (TTT_Game_Lobby__c record : [SELECT TTT_Player__c FROM TTT_Game_Lobby__c WHERE ID NOT IN :recordList AND TTT_Is_Game_Set__c = false]) { // Picking existing players awaiting in the lobby
            gameLobbyList.add(record);
        }

        gameLobbyList.addAll(recordList);

        if(gameLobbyList.size() == 1) {return;}

        for(Integer i = 0; i < gameLobbyList.size() - 1; i = i + 2) { 
            if(gameLobbyList[i].TTT_Player__c == gameLobbyList[i+1].TTT_Player__c) continue;
            gameAreaList.add(
                new TTT_Game_Area__c(
                    TTT_Player_One__c = gameLobbyList[i].TTT_Player__c,
                    TTT_Player_One_Id__c = gameLobbyList[i].Id + '__' + gameLobbyList[i].TTT_Player__c,
                    TTT_Player_Two__c = gameLobbyList[i+1].TTT_Player__c,
                    TTT_Player_Two_Id__c = gameLobbyList[i+1].Id + '__' + gameLobbyList[i+1].TTT_Player__c
                )
            );

            lobbyListAddedToGameArea.add(new TTT_Game_Lobby__c(Id = gameLobbyList[i].Id, TTT_Is_Game_Set__c = true));
            lobbyListAddedToGameArea.add(new TTT_Game_Lobby__c(Id = gameLobbyList[i+1].Id, TTT_Is_Game_Set__c = true));
        }   

        if(gameAreaList.isEmpty()) {return;}

        insert gameAreaList; 
        updateGameSetFlagInLobby(lobbyListAddedToGameArea);        

    }

    /* @Desc: set TTT_Is_Game_Set__c flag on lobby once the players are added to the game area */
    public static void updateGameSetFlagInLobby(List<TTT_Game_Lobby__c> recordList) {
        update recordList;
    }

}