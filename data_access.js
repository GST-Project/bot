var monk = require('monk');

var theQuery = require("./create_query")

//All this functions call our backend sever on MongoDB
module.exports = {
 
 //Function to find any item in our backend server
	matchProject: function (resp, dataDone) {
		var collection = db2.get('projects');
		console.log("match "+resp);
		collection.find({need : resp}, function (err, doc) {	
			console.log("found "+ JSON.stringify(doc));
			if (doc){
				dataDone(doc);
			}
		});
			
	},
  //function to search information from our existing user with an email is the primary key to find them. This function seaches in the crawl database
	searchByEmail: function (resp, dataDone){
		var collection = db2.get('crawl');
		collection.findOne({email : resp}, function (err, doc) {
                        console.log("found "+ JSON.stringify(doc));
                        if (doc){
                                dataDone(doc);
                        }
                });	
		//dataDone("You have a long beard with "+ resp);

	},
	
  //this function searches users by email in the crawl database using a query as a parameter
	searchUser: function (resp, dataDone) {
		var collection = db2.get('crawl');
		
		collection.find(theQuery.createQuery(resp),{}, function(e, docs) {
			var message = '';
			if (docs.length > 0){
				message = "Ok, so I found "+docs.length+" people in "+resp;
				dataDone(message);
			}
			var data = [];
			for (var i = 0;i<docs.length;i++){
				console.log("coming here "+resp+" "+docs[i].first_name);
				var theEmail = docs[i].email[0];
				if (typeof docs[i].email === 'string') theEmail = docs[i].email.trim();	
				
				db2.get("people2").findOne({email:theEmail}, function(e, doc){
					
					var theLocation = doc.location[0];
                                	if (typeof doc.location === 'string') theLocation = doc.location.trim();
					var message2 = doc.full_name+" "+doc.company_url+" "+theLocation;
					dataDone(message2);
			
				});
			}
					
		});
	}
}
