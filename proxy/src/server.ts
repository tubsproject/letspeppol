import express from 'express';

export async function startServer(): Promise<void> {
  const app = express();
  const port = process.env.PORT || 3000;
  await new Promise(resolve => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
      resolve();
    });
  })
}

