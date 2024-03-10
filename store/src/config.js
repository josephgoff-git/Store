let localServer = false

let serverURL = "http://localhost:8080"
let frontendURL = "http://localhost:3000"  

if (!localServer) {serverURL = "https://store.expertsoncall.online"}
if (process.env.NODE_ENV === 'production') {
    // serverURL = "http://ec2-18-227-140-97.us-east-2.compute.amazonaws.com:8080"
    serverURL = "https://store.expertsoncall.online"
    frontendURL = "https://opendreamdesign.com"
}

let data = [serverURL, frontendURL]
export default data 