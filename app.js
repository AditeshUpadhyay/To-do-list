const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todolistDB" , {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
    name : "Welcome to your todolist!"
});

const item2 = new Item({
    name : "Hit the + button to add a new item."
});

const Item3 = new Item({
    name : "<-- Hit this to delete an item."
})

const defaultItems = [item1 ,item2 , Item3];

const listSchema = {
    name : String,
    items : [itemsSchema]
};

const List = mongoose.model("List" , listSchema);


app.get("/" , function(req , res){
   
    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
          Item.insertMany(defaultItems , function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log("Succesfully saved default items to database");
    }
});
       res.redirect("/");
        }

        else{
            res.render("list" , {listTitle : "Today" , newListItems : foundItems});
        }

       
    })
     
    

   
});


app.post("/" , function(req , res){

   const itemName = req.body.newItem;
   const listName = req.body.list;


   const item = new Item({
    name: itemName
   });
   
   if(listName === "Today"){
    item.save();

    res.redirect("/");  

   }
   else{
       List.findOne({name: listName} , function(err , foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
       });
   }

  
  
});


app.post("/delete" , function(req , res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
        if(!err){
            console.log("Successfully deleted checked item,");
            res.redirect("/");
        }
      });
  }
else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}} , function(err , foundList){
        if(!err){
            res.redirect("/" + listName);
        }
    });
}
 

});


app.get("/:customListName" , function(req , res){
    const customListName = req.params.customListName;
    
    List.findOne({name: customListName}, function(err , foundList){
        if(!err){
            if(!foundList){
             // create a new list
             const list = new List({
                name : customListName,
                items : defaultItems  
            });
        
            list.save();
          


            }
            else{
               // show an existing list
               res.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    });




    
});


// app.get("/work", function(req , res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// })

app.post("/work" , function(req , res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.listen(port , function(){
    console.log(`server has started on ${port} `);
})