const express = require("express");

const router = express.Router();

const {
    createClaim,
    getClaims,
    approveClaim,
     getOwnerClaims,
    rejectClaim
} = require("../controllers/claimController");
router.post("/", createClaim);

router.get("/", getClaims);
router.get("/owner/:ownerId", getOwnerClaims);
router.put(
    "/approve/:id",
    approveClaim
);

router.put(
    "/reject/:id",
    rejectClaim
);

module.exports = router;