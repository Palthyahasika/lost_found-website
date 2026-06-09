const ClaimRequest = require("../models/ClaimRequest");

const createClaim = async (req, res) => {

    console.log("Claim API Hit");
    console.log(req.body);

    try {

        const claim = await ClaimRequest.create(req.body);

        res.status(201).json({
            message: "Claim request sent",
            claim
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

const getClaims = async (req, res) => {

    try {

        const claims = await ClaimRequest.find()
            .populate("itemId")
            .populate("claimantId", "name email");

        res.status(200).json(claims);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};
const approveClaim = async (req, res) => {

    try {

        const claim =
        await ClaimRequest.findById(req.params.id);

        if(!claim){
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        claim.status = "Approved";

        await claim.save();

        res.status(200).json({
            message: "Claim Approved",
            claim
        });

    }
    catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};

const rejectClaim = async (req, res) => {

    try {

        const claim =
        await ClaimRequest.findById(req.params.id);

        if(!claim){
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        claim.status = "Rejected";

        await claim.save();

        res.status(200).json({
            message: "Claim Rejected",
            claim
        });

    }
    catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};
const getOwnerClaims = async (req, res) => {
  try {
    const claims = await ClaimRequest.find({
      ownerId: req.params.ownerId
    })
      .populate("itemId")
      .populate("claimantId", "name email");

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
module.exports = {
    createClaim,
    getClaims,
     getOwnerClaims,
    approveClaim,
    rejectClaim
};