import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Settings from '../models/Settings.model.js';

export const getSettings = asyncHandler(async (req, res) => {
    const settings = await Settings.find({}).lean();
    
    // Convert array of {key, value} to a single object
    const settingsObj = {};
    settings.forEach(s => {
        settingsObj[s.key] = s.value;
    });

    res.status(200).json(new ApiResponse(200, settingsObj, 'Settings fetched successfully.'));
});

export const updateSettings = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const updateData = req.body;

    const setting = await Settings.findOneAndUpdate(
        { key: category },
        { value: updateData },
        { new: true, upsert: true }
    );

    res.status(200).json(new ApiResponse(200, setting, `Settings for ${category} updated.`));
});
