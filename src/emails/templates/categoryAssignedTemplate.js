export const categoryAssignedTemplate = async (user, category) => {
  return {
    subject: "Category Assigned to You!",
    text: `Hello ${user.name},

A new category has been assigned to you.

Category Name: ${category.name}
Description: ${category.description || "No description provided."}

Please check your dashboard for more details.

– Team Node - X`,

    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Hello ${user.name},</h2>
        <p>🎉 A new category has been assigned to you!</p>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin: 10px 0;">
          <p><strong>Category Name:</strong> ${category.name}</p>
          <p><strong>Description:</strong> ${
            category.description || "No description provided."
          }</p>
        </div>

      
        <p>Please log in to your dashboard to view more details.</p>
        <br/>
        <p>– Team Priyanshu</p>
      </div>
    `,

    attachments: category.qrPath
      ? [
          {
            filename: `${category._id}.png`,
            path: category.qrPath,
            cid: "categoryqr",
          },
        ]
      : [],
  };
};
