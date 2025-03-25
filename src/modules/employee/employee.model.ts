import { TEmployeeDoc, TEmployeeModel } from '@/modules/employee';
import { TDocumentId } from '@/modules/validate';
import { parsePhoneNumber } from 'libphonenumber-js';
import { model, Schema } from 'mongoose';
import { paginate } from '../paginate';
import { toJSON } from '../toJSON';

const employeeSchema = new Schema<TEmployeeDoc, TEmployeeModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    phone_number: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => {
          const phoneNumber = parsePhoneNumber(value);
          return phoneNumber?.isValid();
        },
        message: 'Invalid phone number format',
      },
    },
    date_of_birth: {
      type: Date,
      required: true,
      validate: {
        validator: (value: Date) => value < new Date(),
        message: 'Date of birth cannot be in the future',
      },
    },
    address: {
      street: { type: String, required: true, trim: true, maxlength: 100 },
      city: { type: String, required: true, trim: true, maxlength: 50 },
      state: { type: String, trim: true, maxlength: 50 },
      country: { type: String, required: true, trim: true, maxlength: 50 },
      postal_code: {
        type: String,
        validate: {
          validator: (value: string) => /^[A-Z0-9\- ]{3,10}$/i.test(value),
          message: 'Invalid postal code format',
        },
      },
    },
    date_of_hire: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: TEmployeeDoc, value: Date) {
          return value > this.date_of_birth;
        },
        message: 'Hire date must be after date of birth',
      },
    },
    job_title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    position: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    salary: {
      base: { type: Number, required: true, min: 0, max: 1000000 },
      currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'GBP'] },
      payment_frequency: {
        type: String,
        required: true,
        enum: ['hourly', 'weekly', 'bi-weekly', 'monthly', 'annual'],
      },
    },
    employment_status: {
      type: String,
      enum: ['active', 'on-leave', 'terminated', 'retired'],
      default: 'active',
    },
    skills: [
      {
        name: { type: String, required: true, maxlength: 50 },
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate',
        },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true, maxlength: 100 },
        issuing_organization: { type: String, required: true, maxlength: 100 },
        issue_date: { type: Date, required: true },
        expiration_date: Date,
      },
    ],
    emergency_contacts: [
      {
        name: { type: String, required: true, maxlength: 100 },
        relationship: { type: String, required: true, maxlength: 50 },
        phone: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add plugins
employeeSchema.plugin(toJSON);
employeeSchema.plugin(paginate);

// Virtuals
employeeSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// Pre-save hooks
employeeSchema.pre('save', function (next) {
  if (this.isModified('phone_number')) {
    const phoneNumber = parsePhoneNumber(this.phone_number);
    this.phone_number = phoneNumber?.formatInternational();
  }
  next();
});

// Static methods
employeeSchema.static('isEmailTaken', async function (email: string, excludeUserId?: TDocumentId) {
  const employee = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!employee;
});

export const Employee = model<TEmployeeDoc, TEmployeeModel>('Employee', employeeSchema);
