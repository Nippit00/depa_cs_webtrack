exports.SaveFile = (req, res, next) => {
  try{
    console.log("Hi")
    res.render("city/upload", { req, });

  }catch(err){
    console.log(err)
  }
  };

  exports.getSaveFile = (req, res, next) => {
    try{
      console.log("get")
      res.render("city/upload", { req, });
  
    }catch(err){
      console.log(err)
    }
    };


