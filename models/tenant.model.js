const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
    tenant_id: { type: String, unique: true, required: true }, // System-generated unique ID
    tenant_code: { type: String, unique: true, required: true }, // User-friendly identifier (company123)
    company_name: { type: String, required: true },
    admin_name: { type: String, required: true },
    email: { type: String, unique: true, required: true }, // Login email
    phone: { type: String },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ["super_admin", "admin", "user"], default: "super_admin" },

    // Subscription Details
    subscription_plan: { type: String, enum: ["free", "basic", "pro", "enterprise"], default: "free" },
    billing_cycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    subscription_status: { type: String, enum: ["active", "canceled", "expired"], default: "active" },
    stripe_customer_id: { type: String }, // Stripe Customer ID for recurring payments
    stripe_subscription_id: { type: String }, // Subscription ID in Stripe
    next_billing_date: { type: Date },

    // Billing Information
    payment_method: { type: String, enum: ["credit_card", "paypal", "bank_transfer"] },
    billing_address: { type: String },
    tax_id: { type: String }, // VAT/GST/Tax ID for invoices
    invoice_history: [{ 
        invoice_id: String, 
        amount: Number, 
        status: String, 
        date: Date 
    }], // Past payments

    // Additional Information
    industry: { type: String },
    company_size: { type: String },
    promo_code: { type: String },
    referred_by: { type: String },

    // Compliance
    gdpr_consent: { type: Boolean, required: true },
    created_at: { type: Date, default: Date.now }
});

// Add indexes for frequently queried fields
tenantSchema.index({ email: 1 });
tenantSchema.index({ tenant_id: 1 });
tenantSchema.index({ stripe_customer_id: 1 });
tenantSchema.index({ stripe_subscription_id: 1 });

// Virtual for full tenant information
tenantSchema.virtual('fullInfo').get(function() {
    return {
        tenant_id: this.tenant_id,
        company_name: this.company_name,
        admin_name: this.admin_name,
        email: this.email,
        subscription: {
            plan: this.subscription_plan,
            status: this.subscription_status,
            billing_cycle: this.billing_cycle,
            next_billing_date: this.next_billing_date
        },
        billing: {
            payment_method: this.payment_method,
            billing_address: this.billing_address,
            tax_id: this.tax_id
        }
    };
});

// Method to check if subscription is active
tenantSchema.methods.hasActiveSubscription = function() {
    return this.subscription_status === 'active';
};

// Method to check if tenant can access specific features based on plan
tenantSchema.methods.canAccessFeature = function(feature) {
    const planFeatures = {
        free: ['basic_analytics', 'single_user'],
        basic: ['basic_analytics', 'single_user', 'priority_support', 'multi_user'],
        pro: ['basic_analytics', 'single_user', 'priority_support', 'multi_user', 'advanced_analytics', 'api_access'],
        enterprise: ['basic_analytics', 'single_user', 'priority_support', 'multi_user', 'advanced_analytics', 'api_access', 'custom_features']
    };

    return planFeatures[this.subscription_plan]?.includes(feature) || false;
};

// Pre-save middleware to ensure tenant_code is unique
tenantSchema.pre('save', async function(next) {
    if (this.isNew) {
        let baseCode = this.company_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        let code = baseCode;
        let counter = 1;
        
        // Keep trying until we find a unique code
        while (true) {
            const existingTenant = await this.constructor.findOne({ tenant_code: code });
            if (!existingTenant) {
                this.tenant_code = code;
                break;
            }
            code = `${baseCode}${counter}`;
            counter++;
        }
    }
    next();
});

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant; 