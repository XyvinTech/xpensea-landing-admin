const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tenant = require('../../models/tenant.model');
const { registerSchema, loginSchema, updateProfileSchema } = require('../../validations/schemas');
const responseHandler = require('../../helpers/responseHandler');

exports.register = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = registerSchema.validate(req.body, { abortEarly: true });
        
        if (error) {
            res.status(400).errorMessage = error.details[0].message;
            return responseHandler(res, 400, res.errorMessage);
        }

        const {
            company_name,
            admin_name,
            email,
            password,
            phone,
            industry,
            company_size
        } = value; // Use validated data

        // Check if email already exists
        let tenant = await Tenant.findOne({ email });
        if (tenant) {
            res.status(400).errorMessage = 'Email already registered';
            return responseHandler(res, 400, res.errorMessage);
        }

        // Generate tenant_id
        const tenant_id = 'TEN' + Date.now();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new tenant
        tenant = new Tenant({
            tenant_id,
            company_name,
            admin_name,
            email,
            phone,
            password: hashedPassword,
            industry,
            company_size,
            gdpr_consent: true
        });

        await tenant.save();

        // Generate JWT token
        const token = jwt.sign(
            { tenant_id: tenant.tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return responseHandler(res, 201, 'Registration successful', {
            token,
            tenant: {
                tenant_id: tenant.tenant_id,
                company_name: tenant.company_name,
                email: tenant.email,
                subscription_plan: tenant.subscription_plan
            }
        });

    } catch (error) {
        res.status(500).errorMessage = `Server error during registration: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.login = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = loginSchema.validate(req.body, { abortEarly: true });
        
        if (error) {
            res.status(400).errorMessage = error.details[0].message;
            return responseHandler(res, 400, res.errorMessage);
        }

        const { email, password } = value; // Use validated data

        // Find tenant by email
        const tenant = await Tenant.findOne({ email });
        if (!tenant) {
            res.status(401).errorMessage = 'Invalid credentials';
            return responseHandler(res, 401, res.errorMessage);
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, tenant.password);
        if (!isMatch) {
            res.status(401).errorMessage = 'Invalid credentials';
            return responseHandler(res, 401, res.errorMessage);
        }

        // Generate JWT token
        const token = jwt.sign(
            { tenant_id: tenant.tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return responseHandler(res, 200, 'Login successful', {
            token,
            tenant: {
                tenant_id: tenant.tenant_id,
                company_name: tenant.company_name,
                email: tenant.email,
                subscription_plan: tenant.subscription_plan
            }
        });

    } catch (error) {
        res.status(500).errorMessage = `Server error during login: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id })
            .select('-password');
        
        if (!tenant) {
            res.status(404).errorMessage = 'Tenant not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        return responseHandler(res, 200, 'Profile retrieved successfully', { tenant });

    } catch (error) {
        res.status(500).errorMessage = `Server error while fetching profile: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: true });
        
        if (error) {
            res.status(400).errorMessage = error.details[0].message;
            return responseHandler(res, 400, res.errorMessage);
        }

        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });
        
        if (!tenant) {
            res.status(404).errorMessage = 'Tenant not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Update fields using validated data
        Object.assign(tenant, value);
        await tenant.save();

        return responseHandler(res, 200, 'Profile updated successfully', {
            tenant: {
                tenant_id: tenant.tenant_id,
                company_name: tenant.company_name,
                email: tenant.email,
                subscription_plan: tenant.subscription_plan
            }
        });

    } catch (error) {
        res.status(500).errorMessage = `Server error while updating profile: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
}; 