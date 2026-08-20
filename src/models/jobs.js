const mongoose = require("mongoose");

const ambitionBoxDataSchema = new mongoose.Schema(
  {
    Url: String,
    ReviewsCount: Number,
    AggregateRating: String,
    Title: String,
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      index: true,
    },

    companyName: {
      type: String,
      index: true,
    },

    companyId: {
      type: Number,
      index: true,
    },

    groupId: {
      type: Number,
      index: true,
    },

    roleCategoryGid: {
      type: String,
      index: true,
    },

    createdDate: {
      type: Date,
      index: true,
    },

    applyByTime: String,

    footerPlaceholderLabel: String,

    footerPlaceholderColor: String,

    experienceText: String,

    minimumExperience: {
      type: Number,
      index: true,
    },

    maximumExperience: {
      type: Number,
      index: true,
    },

    jobDescription: String,

    placeholders: {
      experience: String,
      salary: String,

      location: {
        type: String,
        index: true,
      },
    },

    salaryDetail: {
      minimumSalary: Number,
      maximumSalary: Number,
      currency: String,
      hideSalary: Boolean,
      variablePercentage: Number,
      minSalaryPerMonth: Number,
      maxSalaryPerMonth: Number,
      ctcBreakup: mongoose.Schema.Types.Mixed,
    },

    ambitionBoxData: {
      type: ambitionBoxDataSchema,
    },

    companyApplyUrl: String,

    applyRedirectUrl: String,

    companyApplyJob: Boolean,

    tagsAndSkills: {
      type: [String],
      default: [],
    },

    mode: {
      type: String,
      index: true,
    },

    additionalData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ jobId: 1 });
jobSchema.index({ title: 1 });
jobSchema.index({ companyName: 1 });

jobSchema.index({
  "placeholders.location": 1,
  minimumExperience: 1,
  maximumExperience: 1,
});

jobSchema.index({ tagsAndSkills: 1 });

jobSchema.index({ createdDate: -1 });

module.exports = mongoose.model("Job", jobSchema);