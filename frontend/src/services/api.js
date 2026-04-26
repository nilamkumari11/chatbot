export const getResponse = async (msg, mode) => {
    const res = await fetch("http://localhost:3000/getResponse", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({ 
            msg,
            mode
        }),
    });

    return res.json();
}