import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req,res) => {
  let result
  try {
  result = await connectionPool.query(`select * from assignments`)
  } catch(error) {
    return res.status(500).json({
      message : "Server could not read assignment because database connection"
    })
  }
  return res.status(200).json({
    data : result.rows
  })
});

app.get("/assignments/:assignmentId", async (req,res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(`select * from assignments where assignment_id = $1`,[assignmentIdFromClient]);
  } catch(error) {
    return res.status(500).json({
      message : "Server could not read assignment because database connection"
    })
  }
  if (!result.rows[0]) {
    return res.status(404).json({
      message : "Server could not find a requested assignment"
    })
  }
  return res.status(200).json({
    data : result.rows[0]
  })
});

app.put("/assignments/:assignmentId", async (req,res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const newAssignment = {...req.body, updated_at: new Date()}
  let result;
  try {
    result = await connectionPool.query(`select * from assignments where assignment_id = $1`,[assignmentIdFromClient]);
    await connectionPool.query(`
      update assignments
      set title = $1,
          content = $2,
          category = $3,
          updated_at = $4
      where assignment_id = $5
      `,[
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.updated_at,
        assignmentIdFromClient
      ]);
  } catch(error) {
    return res.status(500).json({
      message : "Server could not read assignment because database connection"
    })
  }
  if (!result.rows[0]) {
    return res.status(404).json({
      message : "Server could not find a requested assignment"
    })
  }
  return res.status(200).json({
    message: "Updated post successfully"
  })
});

app.delete("/assignments/:assignmentId", async (req,res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(`select * from assignments where assignment_id = $1`,[assignmentIdFromClient]);
    await connectionPool.query(`delete from assignments where assignment_id = $1`,[assignmentIdFromClient]);
  } catch(error) {
    return res.status(500).json({
      message : "Server could not read assignment because database connection"
    })
  }
  if (!result.rows[0]) {
    return res.status(404).json({
      message : "Server could not find a requested assignment"
    })
  }
  return res.status(200).json({
    message: "Deleted post successfully"
  })
});

app.post("/assignments", async (req,res) => {
  const newAssignment = {
    ...req.body,
    length: "short",
    user_id: 1,
    status: "published",
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  }

  if (!newAssignment.title || !newAssignment.content || !newAssignment.category) {
    return res.status(400).json({
      message: "Server could not create assignment because there are missing data from client"
    });
  }

  try {
      await connectionPool.query(`
      insert into assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
    [
      newAssignment.title,
      newAssignment.content,
      newAssignment.category,
      newAssignment.length,
      newAssignment.user_id,
      newAssignment.status,
      newAssignment.created_at,
      newAssignment.updated_at,
      newAssignment.published_at,
    ])
  } catch(error) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection"
    });
  }

  return res.status(201).json({
    message: "Created assignment successfully"
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});