export const getLocalizedNotification = (notification: any, t: any) => {
  const { type, title, message } = notification;

  if (type === "ATTENDANCE_CHECKED_IN") {
    const match = message.match(/^(.*) checked in for (.*)\.$/);
    if (match) {
      return {
        title: t("notifications.types.ATTENDANCE_CHECKED_IN.title"),
        message: t("notifications.types.ATTENDANCE_CHECKED_IN.message", {
          workerName: match[1],
          jobTitle: match[2],
        }),
      };
    }
  }

  if (type === "ATTENDANCE_CHECKED_OUT") {
    const match = message.match(/^(.*) checked out from (.*)\.$/);
    if (match) {
      return {
        title: t("notifications.types.ATTENDANCE_CHECKED_OUT.title"),
        message: t("notifications.types.ATTENDANCE_CHECKED_OUT.message", {
          workerName: match[1],
          jobTitle: match[2],
        }),
      };
    }
  }

  if (type === "ATTENDANCE_APPROVED") {
    const match = message.match(/^Your attendance for (.*) was approved\.$/);
    if (match) {
      return {
        title: t("notifications.types.ATTENDANCE_APPROVED.title"),
        message: t("notifications.types.ATTENDANCE_APPROVED.message", {
          jobTitle: match[1],
        }),
      };
    }
  }

  if (type === "ATTENDANCE_ISSUE_REPORTED") {
    const match = message.match(/^An issue was reported for your attendance on (.*)\.$/);
    if (match) {
      return {
        title: t("notifications.types.ATTENDANCE_ISSUE_REPORTED.title"),
        message: t("notifications.types.ATTENDANCE_ISSUE_REPORTED.message", {
          jobTitle: match[1],
        }),
      };
    }
  }

  if (type === "EMPLOYER_MARKED_PAID") {
    return {
      title: t("notifications.types.EMPLOYER_MARKED_PAID.title"),
      message: t("notifications.types.EMPLOYER_MARKED_PAID.message"),
    };
  }

  if (type === "WORKER_CONFIRMED_PAID") {
    return {
      title: t("notifications.types.WORKER_CONFIRMED_PAID.title"),
      message: t("notifications.types.WORKER_CONFIRMED_PAID.message"),
    };
  }

  if (type === "WORKER_SELECTED") {
    const match = message.match(/^You have been selected for the job: (.*)\.$/);
    if (match) {
      return {
        title: t("notifications.types.WORKER_SELECTED.title"),
        message: t("notifications.types.WORKER_SELECTED.message", {
          jobTitle: match[1],
        }),
      };
    }
  }

  if (type === "DISPUTE_CREATED") {
    const match = message.match(/^A employer has raised a dispute regarding your attendance on job: "(.*)"\. Reason: (.*)\.$/);
    if (match) {
      return {
        title: t("notifications.types.DISPUTE_CREATED.title"),
        message: t("notifications.types.DISPUTE_CREATED.message", {
          jobTitle: match[1],
          reason: match[2],
        }),
      };
    }
  }

  if (type === "DISPUTE_COUNTERED") {
    const match = message.match(/^The worker has responded to your dispute on job: "(.*)"\. Both submissions are now locked for admin review\.$/);
    if (match) {
      return {
        title: t("notifications.types.DISPUTE_COUNTERED.title"),
        message: t("notifications.types.DISPUTE_COUNTERED.message", {
          jobTitle: match[1],
        }),
      };
    }
  }

  return { title, message };
};
