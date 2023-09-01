const getLtik = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const ltik = searchParams.get("ltik");
  if (!ltik) throw new Error("Missing lti key.");
  return ltik;
};

const globalLtik = getLtik();

async function getLtiUserData() {
  try {
    const b = {
      ltik: getLtik(),
    };
    const response = await fetch(`/info?ltik=${b.ltik}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null;
  }
}

async function submitGrade(grade) {
  const b = {
    grade,
  };
  try {
    const response = await fetch("/grade", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getLtik(),
      },
      body: JSON.stringify(b),
    });
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    const data = await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};


