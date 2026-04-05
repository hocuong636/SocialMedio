const mongoose = require("mongoose");
const roleModel = require("./schemas/roles");

async function seedRole() {
    try {
        await mongoose.connect('mongodb://localhost:27019/SocialMedia?directConnection=true');
        console.log("MongoDB connected");

        let existingRole = await roleModel.findOne({ name: 'user' });

        if (!existingRole) {
            let newRole = new roleModel({
                name: 'user',
                description: 'Nguoi dung mac dinh'
            });
            await newRole.save();
            console.log("Da tao thanh cong role 'user'");
        } else {
            console.log("Role 'user' da ton tai");
        }

    } catch (error) {
        console.error("Loi:", error.message);
    } finally {
        mongoose.disconnect();
    }
}

seedRole();
