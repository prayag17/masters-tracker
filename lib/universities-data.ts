export interface UniversityProgram {
  programName: string
  department: string
}

export interface UniversityEntry {
  name: string
  country: string
  city: string
  programs: UniversityProgram[]
  websiteUrl?: string
}

export const UNIVERSITIES: UniversityEntry[] = [
  // ─── USA ──────────────────────────────────────────────────────────────────
  {
    name: "Massachusetts Institute of Technology (MIT)",
    country: "USA", city: "Cambridge, MA",
    websiteUrl: "https://www.eecs.mit.edu/academics/graduate-programs/",
    programs: [
      { programName: "MS in Computer Science", department: "EECS" },
      { programName: "MS in Electrical Engineering & Computer Science", department: "EECS" },
      { programName: "MS in Data Science & Machine Learning", department: "IDSS" },
      { programName: "MS in Computational Science & Engineering", department: "CCSE" },
    ],
  },
  {
    name: "Stanford University",
    country: "USA", city: "Stanford, CA",
    websiteUrl: "https://cs.stanford.edu/academics/masters",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Artificial Intelligence", department: "Computer Science" },
      { programName: "MS in Computer & Network Security", department: "Computer Science" },
      { programName: "MS in Electrical Engineering", department: "Electrical Engineering" },
      { programName: "MS in Statistics", department: "Statistics" },
      { programName: "MS in Management Science & Engineering", department: "MS&E" },
    ],
  },
  {
    name: "Carnegie Mellon University (CMU)",
    country: "USA", city: "Pittsburgh, PA",
    websiteUrl: "https://www.cs.cmu.edu/academics",
    programs: [
      { programName: "MS in Computer Science", department: "School of Computer Science" },
      { programName: "MS in Machine Learning", department: "Machine Learning" },
      { programName: "MS in Artificial Intelligence", department: "School of Computer Science" },
      { programName: "MS in Robotics", department: "Robotics Institute" },
      { programName: "MS in Software Engineering", department: "Institute for Software Research" },
      { programName: "MS in Information Technology", department: "Heinz College" },
      { programName: "MS in Computational Data Science", department: "School of Computer Science" },
      { programName: "MS in Human-Computer Interaction", department: "HCII" },
    ],
  },
  {
    name: "UC Berkeley",
    country: "USA", city: "Berkeley, CA",
    websiteUrl: "https://eecs.berkeley.edu/academics/graduate",
    programs: [
      { programName: "MS in Electrical Engineering & Computer Science", department: "EECS" },
      { programName: "MS in Data Science", department: "School of Information" },
      { programName: "MEng in Electrical Engineering & Computer Science", department: "EECS" },
      { programName: "MS in Industrial Engineering & Operations Research", department: "IEOR" },
    ],
  },
  {
    name: "Georgia Institute of Technology",
    country: "USA", city: "Atlanta, GA",
    websiteUrl: "https://www.cc.gatech.edu/academics",
    programs: [
      { programName: "MS in Computer Science", department: "College of Computing" },
      { programName: "MS in Machine Learning", department: "College of Computing" },
      { programName: "MS in Robotics", department: "Institute for Robotics and Intelligent Machines" },
      { programName: "MS in Cybersecurity", department: "College of Computing" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Analytics", department: "H. Milton Stewart School of ISyE" },
    ],
  },
  {
    name: "University of Illinois Urbana-Champaign (UIUC)",
    country: "USA", city: "Champaign, IL",
    websiteUrl: "https://cs.illinois.edu/academics/graduate",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MCS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Information Management", department: "School of Information Sciences" },
      { programName: "MS in Statistics", department: "Statistics" },
    ],
  },
  {
    name: "University of Michigan",
    country: "USA", city: "Ann Arbor, MI",
    websiteUrl: "https://cse.engin.umich.edu/academics/graduate",
    programs: [
      { programName: "MS in Computer Science & Engineering", department: "CSE" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Data Science", department: "School of Information" },
      { programName: "MS in Robotics", department: "Robotics Institute" },
    ],
  },
  {
    name: "University of Texas at Austin (UT Austin)",
    country: "USA", city: "Austin, TX",
    websiteUrl: "https://www.cs.utexas.edu/graduate",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Data Science", department: "School of Information" },
      { programName: "MS in Operations Research & Industrial Engineering", department: "ORIE" },
    ],
  },
  {
    name: "University of Washington",
    country: "USA", city: "Seattle, WA",
    websiteUrl: "https://www.cs.washington.edu/academics/graduate",
    programs: [
      { programName: "MS in Computer Science", department: "Paul G. Allen School" },
      { programName: "MS in Data Science", department: "Paul G. Allen School" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Human Centered Design & Engineering", department: "HCDE" },
    ],
  },
  {
    name: "Columbia University",
    country: "USA", city: "New York, NY",
    websiteUrl: "https://www.cs.columbia.edu/education/ms/",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Data Science", department: "Data Science Institute" },
      { programName: "MS in Machine Learning", department: "Computer Science" },
      { programName: "MS in Electrical Engineering", department: "Electrical Engineering" },
      { programName: "MS in Financial Engineering", department: "IEOR" },
    ],
  },
  {
    name: "Cornell University",
    country: "USA", city: "Ithaca, NY",
    websiteUrl: "https://www.cs.cornell.edu/masters",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MEng in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Information Science", department: "Cornell Ann S. Bowers CIS" },
      { programName: "MS in Operations Research", department: "ORIE" },
    ],
  },
  {
    name: "New York University (NYU)",
    country: "USA", city: "New York, NY",
    websiteUrl: "https://cs.nyu.edu/home/master",
    programs: [
      { programName: "MS in Computer Science", department: "Courant Institute" },
      { programName: "MS in Data Science", department: "Center for Data Science" },
      { programName: "MS in Cybersecurity", department: "Tandon School of Engineering" },
      { programName: "MS in Electrical Engineering", department: "Tandon School of Engineering" },
    ],
  },
  {
    name: "UCLA",
    country: "USA", city: "Los Angeles, CA",
    websiteUrl: "https://www.cs.ucla.edu/graduates/",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Data Science Engineering", department: "Computer Science" },
    ],
  },
  {
    name: "UC San Diego (UCSD)",
    country: "USA", city: "La Jolla, CA",
    websiteUrl: "https://cse.ucsd.edu/graduate",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science & Engineering" },
      { programName: "MS in Data Science", department: "Halıcıoğlu Data Science Institute" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Artificial Intelligence", department: "Computer Science & Engineering" },
    ],
  },
  {
    name: "University of Southern California (USC)",
    country: "USA", city: "Los Angeles, CA",
    websiteUrl: "https://www.cs.usc.edu/academic-programs/masters/",
    programs: [
      { programName: "MS in Computer Science", department: "Viterbi School of Engineering" },
      { programName: "MS in Data Science", department: "Viterbi School of Engineering" },
      { programName: "MS in Artificial Intelligence", department: "Viterbi School of Engineering" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
    ],
  },
  {
    name: "Purdue University",
    country: "USA", city: "West Lafayette, IN",
    websiteUrl: "https://www.cs.purdue.edu/graduate/",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Data Science", department: "Statistics" },
    ],
  },
  {
    name: "University of Maryland, College Park",
    country: "USA", city: "College Park, MD",
    websiteUrl: "https://www.cs.umd.edu/grad/graduate",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MPS in Applied Machine Learning", department: "Computer Science" },
    ],
  },
  {
    name: "University of Wisconsin-Madison",
    country: "USA", city: "Madison, WI",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical Engineering", department: "Electrical Engineering" },
      { programName: "MS in Data Science", department: "Statistics" },
    ],
  },
  {
    name: "Northeastern University",
    country: "USA", city: "Boston, MA",
    programs: [
      { programName: "MS in Computer Science", department: "Khoury College of Computer Sciences" },
      { programName: "MS in Data Architecture", department: "Khoury College of Computer Sciences" },
      { programName: "MS in Cybersecurity", department: "Khoury College of Computer Sciences" },
      { programName: "MS in Artificial Intelligence", department: "Khoury College of Computer Sciences" },
    ],
  },
  {
    name: "Boston University",
    country: "USA", city: "Boston, MA",
    programs: [
      { programName: "MS in Computer Science", department: "Computer Science" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Artificial Intelligence", department: "Faculty of Computing & Data Sciences" },
    ],
  },
  {
    name: "University of Pennsylvania (UPenn)",
    country: "USA", city: "Philadelphia, PA",
    programs: [
      { programName: "MSE in Computer & Information Science", department: "CIS" },
      { programName: "MS in Data Science", department: "Engineering & Applied Science" },
      { programName: "MS in Robotics", department: "GRASP Laboratory" },
    ],
  },
  {
    name: "Johns Hopkins University",
    country: "USA", city: "Baltimore, MD",
    programs: [
      { programName: "MS in Computer Science", department: "Whiting School of Engineering" },
      { programName: "MS in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MS in Data Science", department: "Whiting School of Engineering" },
      { programName: "MS in Robotics", department: "Whiting School of Engineering" },
    ],
  },
  {
    name: "Arizona State University (ASU)",
    country: "USA", city: "Tempe, AZ",
    programs: [
      { programName: "MS in Computer Science", department: "Fulton Schools of Engineering" },
      { programName: "MS in Artificial Intelligence", department: "Fulton Schools of Engineering" },
      { programName: "MS in Software Engineering", department: "Fulton Schools of Engineering" },
    ],
  },

  // ─── Canada ───────────────────────────────────────────────────────────────
  {
    name: "University of Toronto",
    country: "Canada", city: "Toronto, ON",
    websiteUrl: "https://web.cs.toronto.edu/graduate",
    programs: [
      { programName: "MSc in Computer Science", department: "Computer Science" },
      { programName: "MS in Applied Computing", department: "Computer Science" },
      { programName: "MSc in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MEng in Electrical & Computer Engineering", department: "ECE" },
    ],
  },
  {
    name: "University of Waterloo",
    country: "Canada", city: "Waterloo, ON",
    websiteUrl: "https://cs.uwaterloo.ca/graduate",
    programs: [
      { programName: "MMath in Computer Science", department: "David R. Cheriton School of CS" },
      { programName: "MASc in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MEng in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MMath in Data Science", department: "David R. Cheriton School of CS" },
    ],
  },
  {
    name: "McGill University",
    country: "Canada", city: "Montreal, QC",
    programs: [
      { programName: "MSc in Computer Science", department: "School of Computer Science" },
      { programName: "MEng in Electrical & Computer Engineering", department: "ECE" },
    ],
  },
  {
    name: "University of British Columbia (UBC)",
    country: "Canada", city: "Vancouver, BC",
    programs: [
      { programName: "MSc in Computer Science", department: "Computer Science" },
      { programName: "MEng in Electrical & Computer Engineering", department: "ECE" },
      { programName: "MDS in Data Science", department: "Statistics" },
    ],
  },
  {
    name: "University of Alberta",
    country: "Canada", city: "Edmonton, AB",
    programs: [
      { programName: "MSc in Computing Science", department: "Computing Science" },
      { programName: "MEng in Electrical & Computer Engineering", department: "ECE" },
    ],
  },

  // ─── Germany ──────────────────────────────────────────────────────────────
  {
    name: "Technical University of Munich (TUM)",
    country: "Germany", city: "Munich",
    websiteUrl: "https://www.tum.de/en/studies/degree-programs/",
    programs: [
      { programName: "MSc in Computer Science", department: "Informatics" },
      { programName: "MSc in Data Engineering & Analytics", department: "Informatics" },
      { programName: "MSc in Robotics, Cognition, Intelligence", department: "Informatics" },
      { programName: "MSc in Electrical Engineering", department: "Electrical Engineering" },
      { programName: "MSc in Informatics: Games Engineering", department: "Informatics" },
    ],
  },
  {
    name: "RWTH Aachen University",
    country: "Germany", city: "Aachen",
    programs: [
      { programName: "MSc in Computer Science", department: "Computer Science" },
      { programName: "MSc in Electrical Engineering", department: "Electrical Engineering" },
      { programName: "MSc in Data Science", department: "Computer Science" },
      { programName: "MSc in Software Systems Engineering", department: "Computer Science" },
    ],
  },
  {
    name: "Karlsruhe Institute of Technology (KIT)",
    country: "Germany", city: "Karlsruhe",
    programs: [
      { programName: "MSc in Computer Science", department: "Computer Science" },
      { programName: "MSc in Electrical Engineering & Information Technology", department: "EIT" },
    ],
  },

  // ─── UK ───────────────────────────────────────────────────────────────────
  {
    name: "Imperial College London",
    country: "UK", city: "London",
    websiteUrl: "https://www.imperial.ac.uk/computing/prospective-students/pg/",
    programs: [
      { programName: "MSc in Computing", department: "Department of Computing" },
      { programName: "MSc in Advanced Computing", department: "Department of Computing" },
      { programName: "MSc in Artificial Intelligence", department: "Department of Computing" },
      { programName: "MSc in Electrical & Electronic Engineering", department: "EEE" },
      { programName: "MSc in Applied Machine Learning", department: "Department of Computing" },
    ],
  },
  {
    name: "University of Edinburgh",
    country: "UK", city: "Edinburgh",
    programs: [
      { programName: "MSc in Computer Science", department: "Informatics" },
      { programName: "MSc in Artificial Intelligence", department: "Informatics" },
      { programName: "MSc in Data Science", department: "Informatics" },
      { programName: "MSc in High Performance Computing", department: "EPCC" },
    ],
  },
  {
    name: "University College London (UCL)",
    country: "UK", city: "London",
    programs: [
      { programName: "MSc in Computer Science", department: "Computer Science" },
      { programName: "MSc in Machine Learning", department: "Computer Science" },
      { programName: "MSc in Data Science & Machine Learning", department: "Computer Science" },
    ],
  },
  {
    name: "University of Oxford",
    country: "UK", city: "Oxford",
    programs: [
      { programName: "MSc in Computer Science", department: "Department of Computer Science" },
      { programName: "MSc in Advanced Computer Science", department: "Department of Computer Science" },
      { programName: "MSc in Statistics", department: "Statistics" },
    ],
  },
  {
    name: "University of Cambridge",
    country: "UK", city: "Cambridge",
    programs: [
      { programName: "MPhil in Advanced Computer Science", department: "Department of Computer Science & Technology" },
      { programName: "MEng in Information & Computer Engineering", department: "Engineering" },
    ],
  },
  {
    name: "University of Manchester",
    country: "UK", city: "Manchester",
    programs: [
      { programName: "MSc in Computer Science", department: "Department of Computer Science" },
      { programName: "MSc in Artificial Intelligence", department: "Department of Computer Science" },
      { programName: "MSc in Data Science", department: "Department of Computer Science" },
    ],
  },

  // ─── Switzerland ─────────────────────────────────────────────────────────
  {
    name: "ETH Zurich",
    country: "Switzerland", city: "Zurich",
    websiteUrl: "https://ethz.ch/en/studies/master.html",
    programs: [
      { programName: "MSc in Computer Science", department: "D-INFK" },
      { programName: "MSc in Data Science", department: "D-INFK" },
      { programName: "MSc in Electrical Engineering & Information Technology", department: "D-ITET" },
      { programName: "MSc in Robotics, Systems & Control", department: "D-MAVT" },
    ],
  },
  {
    name: "EPFL",
    country: "Switzerland", city: "Lausanne",
    programs: [
      { programName: "MSc in Computer Science", department: "IC School" },
      { programName: "MSc in Data Science", department: "IC School" },
      { programName: "MSc in Electrical Engineering", department: "STI School" },
    ],
  },

  // ─── Netherlands ─────────────────────────────────────────────────────────
  {
    name: "Delft University of Technology (TU Delft)",
    country: "Netherlands", city: "Delft",
    programs: [
      { programName: "MSc in Computer Science", department: "Software Technology" },
      { programName: "MSc in Electrical Engineering", department: "EE, Mathematics & CS" },
      { programName: "MSc in Data Science & Technology", department: "EEMCS" },
    ],
  },

  // ─── Singapore ────────────────────────────────────────────────────────────
  {
    name: "National University of Singapore (NUS)",
    country: "Singapore", city: "Singapore",
    programs: [
      { programName: "MSc in Computer Science", department: "School of Computing" },
      { programName: "MSc in Artificial Intelligence", department: "School of Computing" },
      { programName: "MSc in Data Science & Machine Learning", department: "School of Computing" },
    ],
  },
  {
    name: "Nanyang Technological University (NTU)",
    country: "Singapore", city: "Singapore",
    programs: [
      { programName: "MSc in Computer Control & Automation", department: "School of EEE" },
      { programName: "MSc in Information Systems", department: "School of Computer Science & Engineering" },
      { programName: "MSc in Artificial Intelligence", department: "School of Computer Science & Engineering" },
    ],
  },
]

/** Fast lookup: given a university name, return its entry */
export function findUniversity(name: string): UniversityEntry | undefined {
  return UNIVERSITIES.find((u) => u.name === name)
}

/** All unique countries in the list */
export const COUNTRIES = [...new Set(UNIVERSITIES.map((u) => u.country))].sort()
