// واجهة بسيطة للتواصل مع SCORM 1.2 API
// هذا الكود يبحث عن الـ API الخاص بـ LMS في النافذة الحالية أو النوافذ الأب

let scormAPI: any = null;

function findAPI(win: any): any {
  let attempts = 0;
  try {
    while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
      attempts++;
      if (attempts > 7) return null;
      win = win.parent;
    }
    return win.API;
  } catch (e) {
    // Catch Cross-Origin errors if running in iframe on different domain
    return null;
  }
}

function getAPI() {
  if (scormAPI) return scormAPI;
  try {
    scormAPI = findAPI(window);
    if ((scormAPI == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
      scormAPI = findAPI(window.opener);
    }
  } catch (e) {
    // Silent fail for SCORM discovery in dev/preview
  }
  return scormAPI;
}

export const ScormService = {
  init: () => {
    const api = getAPI();
    if (api) {
      const status = api.LMSInitialize("");
      if (status === "true") {
        console.log("SCORM Initialized");
        // تعيين الحالة المبدئية إلى "لم يكتمل"
        api.LMSSetValue("cmi.core.lesson_status", "incomplete");
        api.LMSCommit("");
      }
    } else {
      // Don't warn in console to keep it clean during dev/preview
      // console.warn("Could not find SCORM API adapter");
    }
  },

  setScore: (score: number, maxScore: number = 100, minScore: number = 0) => {
    const api = getAPI();
    if (api) {
      api.LMSSetValue("cmi.core.score.raw", score.toString());
      api.LMSSetValue("cmi.core.score.max", maxScore.toString());
      api.LMSSetValue("cmi.core.score.min", minScore.toString());
      api.LMSCommit("");
      console.log(`SCORM Score set to ${score}`);
    }
  },

  setCompletionStatus: (status: "completed" | "passed" | "failed" | "incomplete") => {
    const api = getAPI();
    if (api) {
      api.LMSSetValue("cmi.core.lesson_status", status);
      api.LMSCommit("");
      console.log(`SCORM Status set to ${status}`);
    }
  },

  terminate: () => {
    const api = getAPI();
    if (api) {
      api.LMSFinish("");
      console.log("SCORM Terminated");
    }
  }
};