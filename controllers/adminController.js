const Train = require('../Models/Train');

exports.addTrain = async(req,res)=>{
    try{
        const newTrain = new Train(req.body);
        await newTrain.save();
        res.status(201).json({message:'Train Added Successfully'});
    }catch(err){
        res.status(400).json({error:err.message});
    }
};

exports.getStats = async (req,res)=>{
    try{
        const totalTrains = await Train.countDocuments();
        res.json({
            totalBookings:1254,
            revenue:45200
        });
    }catch(err){
        res.status(500).json({error:err.message});
    }
};