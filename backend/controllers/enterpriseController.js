const Enterprise = require('../models/enterpriseModel');

exports.createEnterprise = async (req, res) => {
    try {
        const { name, mobile, company, email } = req.body;

        if (!name || !mobile || !company || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const cleanMobile = mobile.trim().replace(/\s+/g, '');

        const existingEnterprise = await Enterprise.findOne({ mobile: cleanMobile });
        if (existingEnterprise) {
            return res.status(409).json({ message: 'User already exists with this mobile number' });
        }

        const newEnterprise = new Enterprise({ name, mobile: cleanMobile, company, email });

        try {
            await newEnterprise.save();
            res.status(201).json({ message: 'Enterprise form submitted successfully.' });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ message: 'User already exists with this mobile number' });
            }
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
