var d = require("durable");

d.ruleset("roof", function () {
  whenAll: {
    first = m.predicate == "eats" && m.object == "flies";
    m.predicate == "lives" && m.object == "water" && m.subject == first.subject;
  }
  run: assert({ subject: first.subject, predicate: "is", object: "frog" });

  whenAll: {
    first = m.predicate == "eats" && m.object == "flies";
    m.predicate == "lives" && m.object == "land" && m.subject == first.subject;
  }
  run: assert({ subject: first.subject, predicate: "is", object: "chameleon" });

  whenAll: m.predicate == "eats" && m.object == "worms";
  run: assert({ subject: m.subject, predicate: "is", object: "bird" });

  whenAll: m.predicate == "is" && m.object == "frog";
  run: assert({ subject: m.subject, predicate: "is", object: "green" });

  whenAll: m.predicate == "is" && m.object == "chameleon";
  run: assert({ subject: m.subject, predicate: "is", object: "green" });

  whenAll: m.predicate == "is" && m.object == "bird";
  run: assert({ subject: m.subject, predicate: "is", object: "black" });

  whenAll: +m.subject;
  run: console.log("fact: " + m.subject + " " + m.predicate + " " + m.object);
});

// a. The entrance sticks out beyond the building line
// b. The building is higher around the entrance, and this height is visible along the approach

d.assert("mainEntrance", {
  subject: "building",
  predicate: "approachAngle",
  object: "acute",
});
d.assert("mainEntrance", {
  subject: "entrancePosition",
  predicate: "beyondBuildingLine",
  object: true,
});
d.assert("mainEntrance", {
  subject: "buildingAroundEntrance",
  predicate: "higher",
  object: true,
});
d.assert("mainEntrance", {
  subject: "buildingAroundEntrance",
  predicate: "visibleAlongApproach",
  object: true,
});

// Locate each room so that it has outdoor space outside it on at least two sides

d.assert("lightOnTwoSides", {
  subject: "room",
  predicate: "windowWallIndexes",
  object: [1, 3],
});
d.assert("lightOnTwoSides", {
  subject: "room",
  predicate: "externalWindows",
  object: [true, true],
});

// Alcoves: make small places at the edge of any common room, usually no more than 6ft wide and 3-6ft deep and possibly much smaller.

d.assert("alcoves", {
  subject: "commonRoom",
  predicate: "numAlcoves",
  object: 2,
});

// 192 windows overlooking life
// place windows in such a way that their total area conforms roughly to the appropriate figures for your region (25% San Francisco)
// and place them in poisitions which give the best possible views out over life: activities in streets, quiet gardens, anything
// different from the indoor scene

d.assert("windowsOverlookingLife", {
  subject: "room",
  predicate: "totalWindowArea",
  object: 2,
});
d.assert("windowsOverlookingLife", {
  subject: "room",
  predicate: "totalFloorArea",
  object: 12,
});

// sleepingToTheEast
d.assert("sleepingToTheEast", {
  subject: "bedroom",
  predicate: "hasEastFacingExternalWindow",
  object: true,
});
