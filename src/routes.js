const router = require("express").Router();
const { log } = require("console");
const path = require("path");

// Requiring Ltijs
const lti = require("ltijs").Provider;

router.post("/getGrade", async (req, res) => {
  const idtoken = res.locals.token;
  const response = await lti.Grade.getScores(
    idtoken,
    idtoken.platformContext.endpoint.lineitem,
    { userId: req.body.userId }
  );
  return res.send(response);
});

// Grading route
router.post("/grade", async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const idtoken = res.locals.token; // IdToken
    const score = data.grade; // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      userId: idtoken.user,
      scoreGiven: score,
      scoreMaximum: 100,
      activityProgress: "Completed",
      gradingProgress: "FullyGraded",
    };

    // Selecting linetItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem; // Attempting to retrieve it from idtoken
    if (!lineItemId) {
      const response = await lti.Grade.getLineItems(idtoken, {
        resourceLinkId: true,
      });
      const lineItems = response.lineItems;
      if (lineItems.length === 0) {
        // Creating line item if there is none
        console.log("Creating new line item");
        const newLineItem = {
          scoreMaximum: 100,
          label: "Grade",
          tag: "grade",
          resourceLinkId: idtoken.platformContext.resource.id,
        };
        const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem);
        lineItemId = lineItem.id;
      } else lineItemId = lineItems[0].id;
    }

    // Sending Grade
    const responseGrade = await lti.Grade.submitScore(
      idtoken,
      lineItemId,
      gradeObj
    );
    return res.send(responseGrade);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ err: err.message });
  }
});

// Names and Roles route
router.post("/members", async (req, res) => {
  console.log("entrei");
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token);
    if (result) return res.send(result.members);
    return res.sendStatus(500);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

router.post("/home", async (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Get user and context information
router.get("/info", async (req, res) => {
  const token = res.locals.token;
  const context = res.locals.context;

  const info = {};
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name;
    if (token.userInfo.email) info.email = token.userInfo.email;
  }
  if (token.user) info.id = token.user;

  console.log("info" + info);

  if (context.roles) info.roles = context.roles;
  if (context.context) info.context = context.context;

  return res.send(info);
});

module.exports = router;
