const express = require('express')
const router = express.Router()
const argon2 = require("argon2");

const controllers = require('../controllers')

function tmp(req, res) {}
router.post('/signup', signUp)
router.post('/login', tmp);


const jwt = require("jsonwebtoken");
const models = require("../models");

async function signUp(req, res) {
    const userDoc = models.User({ 
        email: req.body.email,
        password: await argon2.hash(req.body.password)
    });
    const refreshTokenDoc = models.RefreshToken({ 
        owner: userDoc.id
    });
    await userDoc.save();
    await refreshTokenDoc.save();
    const refreshToken = createRefreshToken(userDoc.id, refreshTokenDoc.id);
    const accessToken = createAccessToken(userDoc.id);
    res.json({ 
        id: userDoc.id,
        accessToken,
        refreshToken
    });
}

function createAccessToken(userId) {
    return jwt.sign({ 
        userId: userId
    }, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: '10m'
    });
}

function createRefreshToken(userId, refreshTokenId) {
    return jwt.sign({ 
        userId: userId,
        tokenId: refreshTokenId
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d'
    });
}

module.exports = router;