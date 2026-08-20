const jobs = require("../models/jobs");
const { normalizeJob } = require("../utility/helpers");


// ============================================================
// CREATE / UPDATE MULTIPLE JOBS
// ============================================================

exports.createJobs = async (req, res) => {
  try {
    const rawJobs = req.body;

    /*
     * Validate request body
     */

    if (!Array.isArray(rawJobs)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of jobs",
      });
    }

    if (rawJobs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Job array cannot be empty",
      });
    }


    /*
     * Build bulk operations
     */

    const operations = [];

    const invalidJobs = [];


    for (const rawJob of rawJobs) {
      try {
        const normalizedJob =
          normalizeJob(rawJob);


        /*
         * Extra safety check
         */

        if (!normalizedJob.jobId) {
          invalidJobs.push({
            title: rawJob?.title ?? null,
            reason: "Missing jobId",
          });

          continue;
        }


        /*
         * Upsert by jobId
         *
         * Existing job:
         *     update it
         *
         * New job:
         *     insert it
         */

        operations.push({
          updateOne: {
            filter: {
              jobId: normalizedJob.jobId,
            },

            update: {
              $set: normalizedJob,
            },

            upsert: true,
          },
        });
      } catch (error) {
        invalidJobs.push({
          jobId: rawJob?.jobId ?? null,
          title: rawJob?.title ?? null,
          reason: error.message,
        });
      }
    }


    /*
     * No valid jobs
     */

    if (operations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid jobs to process",
        received: rawJobs.length,
        invalid: invalidJobs.length,
        invalidJobs,
      });
    }


    /*
     * Bulk write
     */

    const result = await jobs.bulkWrite(
      operations,
      {
        ordered: false,
      }
    );


    return res.status(200).json({
      success: true,

      message:
        "Jobs processed successfully",

      data: {
        received: rawJobs.length,

        processed: operations.length,

        invalid: invalidJobs.length,

        inserted:
          result.upsertedCount,

        updated:
          result.modifiedCount,

        matched:
          result.matchedCount,

        invalidJobs,
      },
    });
  } catch (error) {
    console.error(
      "Bulk job creation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process jobs",

      error: error.message,
    });
  }
};


// ============================================================
// GET RECENT JOBS
//
// Last 21 days
// Latest first
// ============================================================

exports.getRecentJobs = async (req, res) => {
  try {
    const threeWeeksAgo = new Date();

    threeWeeksAgo.setDate(
      threeWeeksAgo.getDate() - 21
    );


    const recentJobs = await jobs
      .find({
        createdDate: {
          $gte: threeWeeksAgo,
        },
      })
      .sort({
        createdDate: -1,
      });


    return res.status(200).json({
      success: true,

      count:
        recentJobs.length,

      data:
        recentJobs,
    });
  } catch (error) {
    console.error(
      "Get recent jobs error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch recent jobs",

      error:
        error.message,
    });
  }
};


// ============================================================
// GET RELEVANT JOBS
//
// Includes:
// - React
// - React.js
// - React Native
// - Frontend Developer
// - Frontend
// - UI Developer
// - UI/UX Developer
// - UI Engineer
// - Frontend Engineer
// - React Developer
// - ReactJS
//
// Last 21 days
// Latest first
// ============================================================

exports.getRelevantJobs = async (req, res) => {
  try {
    const threeWeeksAgo = new Date();

    threeWeeksAgo.setDate(
      threeWeeksAgo.getDate() - 21
    );


    /*
     * Frontend / UI skills
     */

    const frontendSkills = [
      "react",
      "react\\.js",
      "react native",
      "frontend developer",
      "frontend",
      "ui developer",
      "ui/ux developer",
      "ui engineer",
      "frontend engineer",
      "react developer",
      "reactjs",
    ];


    /*
     * Convert skills to regex
     */

    const frontendRegex = new RegExp(
      `\\b(${frontendSkills.join("|")})\\b`,
      "i"
    );


    /*
     * Search:
     *
     * title
     *
     * OR
     *
     * tagsAndSkills
     *
     * AND
     *
     * createdDate >= last 21 days
     */

    const filter = {
      createdDate: {
        $gte: threeWeeksAgo,
      },

      $or: [
        {
          title: frontendRegex,
        },

        {
          tagsAndSkills:
            frontendRegex,
        },
      ],
    };


    /*
     * Get jobs
     *
     * - Latest first
     */

    const jobsList = await jobs
      .find(filter)
      .sort({
        createdDate: -1,
      });


    return res.status(200).json({
      success: true,

      count:
        jobsList.length,

      data:
        jobsList,
    });
  } catch (error) {
    console.error(
      "Get relevant jobs error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch relevant jobs",

      error:
        error.message,
    });
  }
};