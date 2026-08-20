const normalizeSkills = (skills) => {
  if (!skills) {
    return [];
  }

  // Already an array
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill).trim())
      .filter(Boolean);
  }

  // Comma-separated string
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};


const getPlaceholder = (placeholders, type) => {
  if (!Array.isArray(placeholders)) {
    return null;
  }

  const placeholder = placeholders.find(
    (item) => item?.type === type
  );

  return placeholder?.label ?? null;
};


const normalizeJob = (rawJob) => {
  if (!rawJob || typeof rawJob !== "object") {
    throw new Error("Invalid job data");
  }

  if (!rawJob.jobId) {
    throw new Error("Job is missing jobId");
  }

  return {
    /*
     * Basic information
     */

    jobId: String(rawJob.jobId),

    title: rawJob.title ?? null,

    companyName: rawJob.companyName ?? null,

    companyId:
      rawJob.companyId != null
        ? Number(rawJob.companyId)
        : null,

    groupId:
      rawJob.groupId != null
        ? Number(rawJob.groupId)
        : null,

    roleCategoryGid:
      rawJob.roleCategoryGid != null
        ? String(rawJob.roleCategoryGid)
        : null,


    /*
     * Job timing
     */

    createdDate: rawJob.createdDate
      ? new Date(Number(rawJob.createdDate))
      : null,

    applyByTime: rawJob.applyByTime ?? null,

    footerPlaceholderLabel:
      rawJob.footerPlaceholderLabel ?? null,

    footerPlaceholderColor:
      rawJob.footerPlaceholderColor ?? null,


    /*
     * Experience
     */

    experienceText:
      rawJob.experienceText ??
      getPlaceholder(
        rawJob.placeholders,
        "experience"
      ),

    minimumExperience:
      rawJob.minimumExperience != null
        ? Number(rawJob.minimumExperience)
        : null,

    maximumExperience:
      rawJob.maximumExperience != null
        ? Number(rawJob.maximumExperience)
        : null,


    /*
     * Job description
     */

    jobDescription:
      rawJob.jobDescription ?? null,


    /*
     * Placeholders
     */

    placeholders: {
      experience:
        getPlaceholder(
          rawJob.placeholders,
          "experience"
        ),

      salary:
        getPlaceholder(
          rawJob.placeholders,
          "salary"
        ),

      location:
        getPlaceholder(
          rawJob.placeholders,
          "location"
        ),
    },


    /*
     * Salary
     */

    salaryDetail: {
      minimumSalary:
        rawJob.salaryDetail?.minimumSalary ?? 0,

      maximumSalary:
        rawJob.salaryDetail?.maximumSalary ?? 0,

      currency:
        rawJob.salaryDetail?.currency ?? null,

      hideSalary:
        rawJob.salaryDetail?.hideSalary ?? false,

      variablePercentage:
        rawJob.salaryDetail?.variablePercentage ?? 0,

      minSalaryPerMonth:
        rawJob.salaryDetail?.minSalaryPerMonth ?? 0,

      maxSalaryPerMonth:
        rawJob.salaryDetail?.maxSalaryPerMonth ?? 0,

      ctcBreakup:
        rawJob.salaryDetail?.ctcBreakup ?? {},
    },


    /*
     * AmbitionBox
     */

    ambitionBoxData:
      rawJob.ambitionBoxData
        ? {
            Url:
              rawJob.ambitionBoxData.Url ??
              null,

            ReviewsCount:
              rawJob.ambitionBoxData.ReviewsCount ??
              0,

            AggregateRating:
              rawJob.ambitionBoxData.AggregateRating ??
              null,

            Title:
              rawJob.ambitionBoxData.Title ??
              null,
          }
        : undefined,


    /*
     * Apply
     */

    companyApplyUrl:
      rawJob.companyApplyUrl ?? null,

    applyRedirectUrl:
      rawJob.applyRedirectUrl ?? null,

    companyApplyJob:
      rawJob.companyApplyJob ?? false,


    /*
     * Skills
     */

    tagsAndSkills: normalizeSkills(
      rawJob.tagsAndSkills
    ),


    /*
     * Mode
     */

    mode: rawJob.mode ?? null,


    /*
     * Keep additional third-party fields
     */

    additionalData: {
      board: rawJob.board,

      jdURL: rawJob.jdURL,

      logoPath: rawJob.logoPath,

      logoPathV3: rawJob.logoPathV3,

      isSaved: rawJob.isSaved,

      saved: rawJob.saved,

      isTopGroup: rawJob.isTopGroup,

      todaysJob: rawJob.todaysJob,

      walkinJob: rawJob.walkinJob,

      questionnaireIdPresent:
        rawJob.questionnaireIdPresent,

      segmentedTemplateId:
        rawJob.segmentedTemplateId,

      showMultipleApply:
        rawJob.showMultipleApply,

      staticUrl:
        rawJob.staticUrl,

      jobAgentEligle:
        rawJob.jobAgentEligle,
    },
  };
};


module.exports = {
  normalizeJob,
  normalizeSkills,
};