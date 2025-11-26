// ============================================
// STAGE CONTROLLER
// ============================================

// Get stage definitions
const getStages = (req, res) => {
    const stages = {
        LOGIN: { id: 1, name: 'Login Page' },
        REGISTER: { id: 2, name: 'Registration Page' },
        HOME: { id: 3, name: 'Home Page' }
    };
    
    return res.status(200).json({
        message: "Stage definitions retrieved successfully",
        stages: stages,
        totalStages: Object.keys(stages).length
    });
};

module.exports = {
    getStages
};

