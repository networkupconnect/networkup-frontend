import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const SUBJECTS = {
  CSE: {
    1: [
      {
        name: "Engineering Physics I",
        units: [
          "Wave Optics",
          "Laser & Fiber Optics",
          "Quantum Mechanics",
          "Band Theory",
          "Superconductivity",
        ],
      },
      {
        name: "Engineering Chemistry",
        units: [
          "Water Chemistry",
          "Polymers",
          "Corrosion",
          "Fuels & Combustion",
          "Spectroscopy",
        ],
      },
      {
        name: "Engineering Mathematics - I",
        units: [
          "Differential Calculus",
          "Integral Calculus",
          "Differential Equations",
          "Laplace Transforms",
          "Vector Calculus",
        ],
      },
      {
        name: "Communication Skills",
        units: [
          "Grammar",
          "Reading Comprehension",
          "Writing Skills",
          "Speaking Skills",
          "Presentation Skills",
        ],
      },
      {
        name: "Constitution of India",
        units: [
          "Historical Background",
          "Preamble & Citizenship",
          "Fundamental Rights",
          "Directive Principles",
          "Constitutional Amendments",
        ],
      },
      {
        name: "Basics of Civil Engineering",
        units: [
          "Building Materials",
          "Construction",
          "Surveying",
          "Roads & Bridges",
          "Water Supply",
        ],
      },
      {
        name: "Basics of Mechanical Engineering",
        units: [
          "Engineering Materials",
          "Manufacturing",
          "Thermodynamics",
          "Fluid Mechanics",
          "Machine Elements",
        ],
      },
      {
        name: "Engineering Physics Lab I",
        units: ["Experiments Set 1", "Experiments Set 2"],
      },
      {
        name: "Engineering Chemistry Lab",
        units: ["Experiments Set 1", "Experiments Set 2"],
      },
      { name: "Language Laboratory", units: ["Lab Sessions"] },
      { name: "Engineering Mechanics Lab", units: ["Lab Sessions"] },
      {
        name: "Engineering Physics II",
        units: [
          "Electromagnetic Theory",
          "Dielectric Properties",
          "Magnetic Properties",
          "Semiconductors",
          "Nano Materials",
        ],
      },
      {
        name: "Engineering Mathematics - II",
        units: [
          "Matrices",
          "Fourier Series",
          "PDE",
          "Z-Transforms",
          "Numerical Methods",
        ],
      },
      {
        name: "Biology for Engineers",
        units: [
          "Cell Biology",
          "Genetics",
          "Biochemistry",
          "Biotechnology",
          "Biomechanics",
        ],
      },
      {
        name: "Environmental Science",
        units: [
          "Ecosystems",
          "Pollution",
          "Natural Resources",
          "Social Issues",
          "Environmental Acts",
        ],
      },
      {
        name: "Basics of Electrical Engineering",
        units: [
          "DC Circuits",
          "AC Circuits",
          "Transformers",
          "Electrical Machines",
          "Measuring Instruments",
        ],
      },
      {
        name: "Basics of Electronics & Communication Engg",
        units: [
          "Semiconductor Devices",
          "Amplifiers",
          "Digital Electronics",
          "Communication Basics",
          "Modulation",
        ],
      },
      {
        name: "Fundamentals of Computing",
        units: [
          "Introduction to Computers",
          "Programming Basics",
          "Algorithms",
          "Data Types",
          "Basic I/O",
        ],
      },
      {
        name: "Engineering Physics Lab II",
        units: ["Experiments Set 1", "Experiments Set 2"],
      },
      {
        name: "Design Thinking & Idea Lab",
        units: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
      },
      {
        name: "Engineering Graphics & Design",
        units: [
          "Orthographic Projection",
          "Isometric Views",
          "Sections",
          "Development",
          "CAD",
        ],
      },
      {
        name: "Workshop Practice",
        units: [
          "Carpentry",
          "Fitting",
          "Welding",
          "Plumbing",
          "Electrical Wiring",
        ],
      },
    ],
    2: [
      {
        name: "Data Structures",
        units: [
          "Arrays & Linked Lists",
          "Stacks & Queues",
          "Trees",
          "Graphs",
          "Sorting & Searching",
        ],
      },
      {
        name: "OOP with Java",
        units: [
          "Classes & Objects",
          "Inheritance",
          "Polymorphism",
          "Exception Handling",
          "Collections",
        ],
      },
      {
        name: "Discrete Mathematics",
        units: [
          "Logic & Proofs",
          "Set Theory",
          "Graph Theory",
          "Combinatorics",
          "Algebraic Structures",
        ],
      },
      {
        name: "Digital Electronics",
        units: [
          "Number Systems",
          "Boolean Algebra",
          "Combinational Circuits",
          "Sequential Circuits",
          "Memory Devices",
        ],
      },
      {
        name: "Computer Organization",
        units: [
          "Basic Structure",
          "Machine Instructions",
          "Memory Organization",
          "I/O Organization",
          "Pipelining",
        ],
      },
      {
        name: "Probability & Statistics",
        units: [
          "Probability",
          "Random Variables",
          "Distributions",
          "Sampling",
          "Hypothesis Testing",
        ],
      },
      {
        name: "Economics",
        units: [
          "Micro Economics",
          "Macro Economics",
          "Market Structures",
          "Indian Economy",
          "Economic Policies",
        ],
      },
    ],
    3: [
      {
        name: "Operating Systems",
        units: [
          "Process Management",
          "Thread & Concurrency",
          "Memory Management",
          "File Systems",
          "Security",
        ],
      },
      {
        name: "DBMS",
        units: [
          "ER Model",
          "Relational Model",
          "SQL",
          "Normalization",
          "Transactions",
        ],
      },
      {
        name: "Computer Networks",
        units: [
          "Physical Layer",
          "Data Link Layer",
          "Network Layer",
          "Transport Layer",
          "Application Layer",
        ],
      },
      {
        name: "Software Engineering",
        units: [
          "SDLC Models",
          "Requirements",
          "Design",
          "Testing",
          "Project Management",
        ],
      },
      {
        name: "Theory of Computation",
        units: [
          "Finite Automata",
          "Regular Languages",
          "Context Free Grammars",
          "Pushdown Automata",
          "Turing Machines",
        ],
      },
      {
        name: "Web Development",
        units: [
          "HTML & CSS",
          "JavaScript",
          "React",
          "Node.js",
          "Databases & APIs",
        ],
      },
      {
        name: "Compiler Design",
        units: [
          "Lexical Analysis",
          "Syntax Analysis",
          "Semantic Analysis",
          "Code Generation",
          "Optimization",
        ],
      },
    ],
    4: [
      {
        name: "Machine Learning",
        units: [
          "Introduction & Regression",
          "Classification",
          "Clustering",
          "Neural Networks",
          "Deep Learning",
        ],
      },
      {
        name: "Cloud Computing",
        units: [
          "Cloud Fundamentals",
          "Virtualization",
          "Cloud Services",
          "Security",
          "Case Studies",
        ],
      },
      {
        name: "Information Security",
        units: [
          "Cryptography",
          "Network Security",
          "Web Security",
          "Forensics",
          "Ethical Hacking",
        ],
      },
      {
        name: "Project",
        units: [
          "Problem Statement",
          "Literature Survey",
          "Design & Implementation",
          "Testing",
          "Final Report",
        ],
      },
      {
        name: "Elective I",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
      {
        name: "Elective II",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
    ],
  },
  ECE: {
    1: [
      {
        name: "Engineering Physics I",
        units: [
          "Wave Optics",
          "Laser & Fiber Optics",
          "Quantum Mechanics",
          "Band Theory",
          "Superconductivity",
        ],
      },
      {
        name: "Engineering Chemistry",
        units: [
          "Water Chemistry",
          "Polymers",
          "Corrosion",
          "Fuels & Combustion",
          "Spectroscopy",
        ],
      },
      {
        name: "Engineering Mathematics - I",
        units: [
          "Differential Calculus",
          "Integral Calculus",
          "Differential Equations",
          "Laplace Transforms",
          "Vector Calculus",
        ],
      },
      {
        name: "Communication Skills",
        units: [
          "Grammar",
          "Reading Comprehension",
          "Writing Skills",
          "Speaking Skills",
          "Presentation Skills",
        ],
      },
      {
        name: "Constitution of India",
        units: [
          "Historical Background",
          "Preamble & Citizenship",
          "Fundamental Rights",
          "Directive Principles",
          "Constitutional Amendments",
        ],
      },
      {
        name: "Basics of Civil Engineering",
        units: [
          "Building Materials",
          "Construction",
          "Surveying",
          "Roads & Bridges",
          "Water Supply",
        ],
      },
      {
        name: "Basics of Mechanical Engineering",
        units: [
          "Engineering Materials",
          "Manufacturing",
          "Thermodynamics",
          "Fluid Mechanics",
          "Machine Elements",
        ],
      },
      {
        name: "Engineering Physics Lab I",
        units: ["Experiments Set 1", "Experiments Set 2"],
      },
      {
        name: "Engineering Chemistry Lab",
        units: ["Experiments Set 1", "Experiments Set 2"],
      },
      { name: "Language Laboratory", units: ["Lab Sessions"] },
      { name: "Engineering Mechanics Lab", units: ["Lab Sessions"] },
      {
        name: "Engineering Physics II",
        units: [
          "Electromagnetic Theory",
          "Dielectric Properties",
          "Magnetic Properties",
          "Semiconductors",
          "Nano Materials",
        ],
      },
      {
        name: "Engineering Mathematics - II",
        units: [
          "Matrices",
          "Fourier Series",
          "PDE",
          "Z-Transforms",
          "Numerical Methods",
        ],
      },
      {
        name: "Biology for Engineers",
        units: [
          "Cell Biology",
          "Genetics",
          "Biochemistry",
          "Biotechnology",
          "Biomechanics",
        ],
      },
      {
        name: "Environmental Science",
        units: [
          "Ecosystems",
          "Pollution",
          "Natural Resources",
          "Social Issues",
          "Environmental Acts",
        ],
      },
      {
        name: "Basics of Electrical Engineering",
        units: [
          "DC Circuits",
          "AC Circuits",
          "Transformers",
          "Electrical Machines",
          "Measuring Instruments",
        ],
      },
      {
        name: "Basics of Electronics & Communication Engg",
        units: [
          "Semiconductor Devices",
          "Amplifiers",
          "Digital Electronics",
          "Communication Basics",
          "Modulation",
        ],
      },
      {
        name: "Fundamentals of Computing",
        units: [
          "Introduction to Computers",
          "Programming Basics",
          "Algorithms",
          "Data Types",
          "Basic I/O",
        ],
      },
      {
        name: "Engineering Physics Lab II",
        units: ["Experiments Set 1", "Experiments Set 2"],
      },
      {
        name: "Design Thinking & Idea Lab",
        units: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
      },
      {
        name: "Engineering Graphics & Design",
        units: [
          "Orthographic Projection",
          "Isometric Views",
          "Sections",
          "Development",
          "CAD",
        ],
      },
      {
        name: "Workshop Practice",
        units: [
          "Carpentry",
          "Fitting",
          "Welding",
          "Plumbing",
          "Electrical Wiring",
        ],
      },
    ],
    2: [
      {
        name: "Network Analysis",
        units: [
          "Basic Concepts",
          "Network Theorems",
          "Resonance",
          "Two-Port Networks",
          "Filters",
        ],
      },
      {
        name: "Electronic Devices",
        units: [
          "Semiconductor Physics",
          "Diodes",
          "Transistors",
          "FETs",
          "Special Devices",
        ],
      },
      {
        name: "Digital Electronics",
        units: [
          "Number Systems",
          "Boolean Algebra",
          "Combinational Circuits",
          "Sequential Circuits",
          "Memory Devices",
        ],
      },
      {
        name: "Signals & Systems",
        units: [
          "Signal Classification",
          "LTI Systems",
          "Fourier Analysis",
          "Laplace Transform",
          "Z-Transform",
        ],
      },
      {
        name: "Mathematics III",
        units: [
          "Complex Analysis",
          "Probability",
          "Statistics",
          "Numerical Methods",
          "Transforms",
        ],
      },
      {
        name: "Electromagnetic Theory",
        units: [
          "Electrostatics",
          "Magnetostatics",
          "Maxwell's Equations",
          "EM Waves",
          "Waveguides",
        ],
      },
    ],
    3: [
      {
        name: "Analog Circuits",
        units: [
          "Amplifier Analysis",
          "Feedback Amplifiers",
          "Oscillators",
          "Power Amplifiers",
          "Op-Amps",
        ],
      },
      {
        name: "Microprocessors",
        units: [
          "8085 Architecture",
          "Instruction Set",
          "Assembly Programming",
          "Interfacing",
          "Applications",
        ],
      },
      {
        name: "Communication Systems",
        units: [
          "AM",
          "FM",
          "Pulse Modulation",
          "Digital Comm",
          "Noise Analysis",
        ],
      },
      {
        name: "Control Systems",
        units: [
          "System Modeling",
          "Transfer Functions",
          "Time Response",
          "Stability",
          "Frequency Response",
        ],
      },
      {
        name: "VLSI Design",
        units: [
          "MOS Transistor",
          "Logic Gates",
          "Combinational Circuits",
          "Sequential Circuits",
          "Testing",
        ],
      },
      {
        name: "DSP",
        units: [
          "Discrete Signals",
          "DFT & FFT",
          "FIR Filters",
          "IIR Filters",
          "Applications",
        ],
      },
    ],
    4: [
      {
        name: "Wireless Communication",
        units: ["Mobile Radio", "Cellular Concepts", "GSM", "CDMA", "4G/5G"],
      },
      {
        name: "Embedded Systems",
        units: [
          "Architecture",
          "Interfacing",
          "RTOS",
          "Protocols",
          "Applications",
        ],
      },
      {
        name: "Antenna Theory",
        units: [
          "Fundamentals",
          "Wire Antennas",
          "Aperture Antennas",
          "Arrays",
          "Applications",
        ],
      },
      {
        name: "Project",
        units: [
          "Problem Statement",
          "Literature Survey",
          "Design & Implementation",
          "Testing",
          "Final Report",
        ],
      },
      {
        name: "Elective I",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
      {
        name: "Elective II",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
    ],
  },
  ME: {
    1: [
      {
        name: "Engineering Physics I",
        units: [
          "Wave Optics",
          "Laser & Fiber Optics",
          "Quantum Mechanics",
          "Band Theory",
          "Superconductivity",
        ],
      },
      {
        name: "Engineering Chemistry",
        units: [
          "Water Chemistry",
          "Polymers",
          "Corrosion",
          "Fuels & Combustion",
          "Spectroscopy",
        ],
      },
      {
        name: "Engineering Mathematics - I",
        units: [
          "Differential Calculus",
          "Integral Calculus",
          "Differential Equations",
          "Laplace Transforms",
          "Vector Calculus",
        ],
      },
      {
        name: "Communication Skills",
        units: [
          "Grammar",
          "Reading Comprehension",
          "Writing Skills",
          "Speaking Skills",
          "Presentation Skills",
        ],
      },
      {
        name: "Constitution of India",
        units: [
          "Historical Background",
          "Preamble & Citizenship",
          "Fundamental Rights",
          "Directive Principles",
          "Constitutional Amendments",
        ],
      },
      {
        name: "Basics of Civil Engineering",
        units: [
          "Building Materials",
          "Construction",
          "Surveying",
          "Roads & Bridges",
          "Water Supply",
        ],
      },
      {
        name: "Basics of Mechanical Engineering",
        units: [
          "Engineering Materials",
          "Manufacturing",
          "Thermodynamics",
          "Fluid Mechanics",
          "Machine Elements",
        ],
      },
      { name: "Engineering Physics Lab I", units: ["Experiments"] },
      { name: "Engineering Chemistry Lab", units: ["Experiments"] },
      { name: "Language Laboratory", units: ["Lab Sessions"] },
      { name: "Engineering Mechanics Lab", units: ["Lab Sessions"] },
      {
        name: "Engineering Physics II",
        units: [
          "EM Theory",
          "Dielectric",
          "Magnetic",
          "Semiconductors",
          "Nano Materials",
        ],
      },
      {
        name: "Engineering Mathematics - II",
        units: [
          "Matrices",
          "Fourier Series",
          "PDE",
          "Z-Transforms",
          "Numerical Methods",
        ],
      },
      {
        name: "Biology for Engineers",
        units: [
          "Cell Biology",
          "Genetics",
          "Biochemistry",
          "Biotechnology",
          "Biomechanics",
        ],
      },
      {
        name: "Environmental Science",
        units: [
          "Ecosystems",
          "Pollution",
          "Natural Resources",
          "Social Issues",
          "Environmental Acts",
        ],
      },
      {
        name: "Basics of Electrical Engineering",
        units: [
          "DC Circuits",
          "AC Circuits",
          "Transformers",
          "Machines",
          "Instruments",
        ],
      },
      {
        name: "Basics of Electronics & Communication Engg",
        units: [
          "Semiconductor Devices",
          "Amplifiers",
          "Digital Electronics",
          "Communication Basics",
          "Modulation",
        ],
      },
      {
        name: "Fundamentals of Computing",
        units: ["Computers", "Programming", "Algorithms", "Data Types", "I/O"],
      },
      { name: "Engineering Physics Lab II", units: ["Experiments"] },
      {
        name: "Design Thinking & Idea Lab",
        units: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
      },
      {
        name: "Engineering Graphics & Design",
        units: ["Orthographic", "Isometric", "Sections", "Development", "CAD"],
      },
      {
        name: "Workshop Practice",
        units: ["Carpentry", "Fitting", "Welding", "Plumbing", "Electrical"],
      },
    ],
    2: [
      {
        name: "Engineering Mechanics",
        units: ["Statics", "Dynamics", "Friction", "Beams", "Kinematics"],
      },
      {
        name: "Thermodynamics",
        units: [
          "Laws of Thermo",
          "Pure Substances",
          "Gas Cycles",
          "Vapor Cycles",
          "Refrigeration",
        ],
      },
      {
        name: "Material Science",
        units: [
          "Crystal Structure",
          "Mechanical Properties",
          "Phase Diagrams",
          "Heat Treatment",
          "Non-metals",
        ],
      },
      {
        name: "Manufacturing Processes",
        units: [
          "Casting",
          "Welding",
          "Forming",
          "Machining",
          "Surface Finishing",
        ],
      },
      {
        name: "Fluid Mechanics",
        units: [
          "Properties",
          "Statics",
          "Kinematics",
          "Dynamics",
          "Viscous Flow",
        ],
      },
      {
        name: "Mathematics III",
        units: [
          "Complex Analysis",
          "Probability",
          "Statistics",
          "Numerical Methods",
          "Transforms",
        ],
      },
    ],
    3: [
      {
        name: "Machine Design",
        units: [
          "Design Philosophy",
          "Shafts & Couplings",
          "Bearings",
          "Gears",
          "Springs",
        ],
      },
      {
        name: "Heat Transfer",
        units: [
          "Conduction",
          "Convection",
          "Radiation",
          "Heat Exchangers",
          "Boiling & Condensation",
        ],
      },
      {
        name: "Theory of Machines",
        units: [
          "Mechanisms",
          "Velocity Analysis",
          "Acceleration",
          "Governors",
          "Vibrations",
        ],
      },
      {
        name: "Industrial Engineering",
        units: [
          "Work Study",
          "Ergonomics",
          "Production Planning",
          "Quality Control",
          "Inventory",
        ],
      },
      {
        name: "Metrology",
        units: [
          "Standards",
          "Linear Measurement",
          "Angular Measurement",
          "Surface Finish",
          "Gauges",
        ],
      },
      {
        name: "CAD/CAM",
        units: [
          "CAD Fundamentals",
          "Modeling",
          "CNC",
          "Part Programming",
          "FMS",
        ],
      },
    ],
    4: [
      {
        name: "Automobile Engineering",
        units: [
          "Engine",
          "Transmission",
          "Steering & Braking",
          "Suspension",
          "Electrical Systems",
        ],
      },
      {
        name: "Robotics",
        units: [
          "Robot Anatomy",
          "Kinematics",
          "Dynamics",
          "Sensors & Actuators",
          "Programming",
        ],
      },
      {
        name: "Project",
        units: [
          "Problem Statement",
          "Literature Survey",
          "Design",
          "Fabrication",
          "Testing",
        ],
      },
      {
        name: "Elective I",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
      {
        name: "Elective II",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
    ],
  },
  CE: {
    1: [
      {
        name: "Engineering Physics I",
        units: [
          "Wave Optics",
          "Laser & Fiber Optics",
          "Quantum Mechanics",
          "Band Theory",
          "Superconductivity",
        ],
      },
      {
        name: "Engineering Chemistry",
        units: [
          "Water Chemistry",
          "Polymers",
          "Corrosion",
          "Fuels & Combustion",
          "Spectroscopy",
        ],
      },
      {
        name: "Engineering Mathematics - I",
        units: [
          "Differential Calculus",
          "Integral Calculus",
          "Differential Equations",
          "Laplace Transforms",
          "Vector Calculus",
        ],
      },
      {
        name: "Communication Skills",
        units: ["Grammar", "Reading", "Writing", "Speaking", "Presentation"],
      },
      {
        name: "Constitution of India",
        units: [
          "Historical Background",
          "Preamble & Citizenship",
          "Fundamental Rights",
          "Directive Principles",
          "Amendments",
        ],
      },
      {
        name: "Basics of Civil Engineering",
        units: [
          "Building Materials",
          "Construction",
          "Surveying",
          "Roads & Bridges",
          "Water Supply",
        ],
      },
      {
        name: "Basics of Mechanical Engineering",
        units: [
          "Materials",
          "Manufacturing",
          "Thermodynamics",
          "Fluid Mechanics",
          "Machine Elements",
        ],
      },
      { name: "Engineering Physics Lab I", units: ["Experiments"] },
      { name: "Engineering Chemistry Lab", units: ["Experiments"] },
      { name: "Language Laboratory", units: ["Sessions"] },
      { name: "Engineering Mechanics Lab", units: ["Sessions"] },
      {
        name: "Engineering Physics II",
        units: [
          "EM Theory",
          "Dielectric",
          "Magnetic",
          "Semiconductors",
          "Nano Materials",
        ],
      },
      {
        name: "Engineering Mathematics - II",
        units: [
          "Matrices",
          "Fourier Series",
          "PDE",
          "Z-Transforms",
          "Numerical Methods",
        ],
      },
      {
        name: "Biology for Engineers",
        units: [
          "Cell Biology",
          "Genetics",
          "Biochemistry",
          "Biotechnology",
          "Biomechanics",
        ],
      },
      {
        name: "Environmental Science",
        units: [
          "Ecosystems",
          "Pollution",
          "Natural Resources",
          "Social Issues",
          "Environmental Acts",
        ],
      },
      {
        name: "Basics of Electrical Engineering",
        units: [
          "DC Circuits",
          "AC Circuits",
          "Transformers",
          "Machines",
          "Instruments",
        ],
      },
      {
        name: "Basics of Electronics & Communication Engg",
        units: [
          "Devices",
          "Amplifiers",
          "Digital",
          "Communication",
          "Modulation",
        ],
      },
      {
        name: "Fundamentals of Computing",
        units: ["Computers", "Programming", "Algorithms", "Data Types", "I/O"],
      },
      { name: "Engineering Physics Lab II", units: ["Experiments"] },
      {
        name: "Design Thinking & Idea Lab",
        units: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
      },
      {
        name: "Engineering Graphics & Design",
        units: ["Orthographic", "Isometric", "Sections", "Development", "CAD"],
      },
      {
        name: "Workshop Practice",
        units: ["Carpentry", "Fitting", "Welding", "Plumbing", "Electrical"],
      },
    ],
    2: [
      {
        name: "Strength of Materials",
        units: [
          "Stress & Strain",
          "Bending",
          "Torsion",
          "Columns",
          "Deflection",
        ],
      },
      {
        name: "Fluid Mechanics",
        units: [
          "Properties",
          "Statics",
          "Kinematics",
          "Dynamics",
          "Flow Measurement",
        ],
      },
      {
        name: "Building Materials",
        units: [
          "Stones & Bricks",
          "Cement & Concrete",
          "Metals",
          "Timber",
          "Modern Materials",
        ],
      },
      {
        name: "Surveying II",
        units: ["Theodolite", "Total Station", "GPS", "Remote Sensing", "GIS"],
      },
      {
        name: "Mathematics III",
        units: [
          "Complex Analysis",
          "Probability",
          "Statistics",
          "Numerical Methods",
          "Transforms",
        ],
      },
      {
        name: "Geology",
        units: [
          "Mineralogy",
          "Rocks",
          "Structural Geology",
          "Groundwater",
          "Engineering Geology",
        ],
      },
    ],
    3: [
      {
        name: "Structural Analysis",
        units: [
          "Energy Methods",
          "Arches",
          "Moving Loads",
          "Matrix Methods",
          "Plastic Analysis",
        ],
      },
      {
        name: "Geotechnical Engineering",
        units: [
          "Soil Classification",
          "Permeability",
          "Consolidation",
          "Shear Strength",
          "Foundation",
        ],
      },
      {
        name: "Transportation Engineering",
        units: [
          "Highway Materials",
          "Pavement Design",
          "Traffic Engineering",
          "Railway",
          "Airport",
        ],
      },
      {
        name: "Environmental Engineering",
        units: [
          "Water Treatment",
          "Sewage Treatment",
          "Solid Waste",
          "Air Pollution",
          "Noise Pollution",
        ],
      },
      {
        name: "Concrete Technology",
        units: [
          "Cement",
          "Aggregates",
          "Mix Design",
          "Special Concrete",
          "Testing",
        ],
      },
    ],
    4: [
      {
        name: "Design of Structures",
        units: ["LSM Concepts", "Beams", "Slabs", "Columns", "Footings"],
      },
      {
        name: "Construction Management",
        units: [
          "Planning",
          "Scheduling",
          "Project Control",
          "Contracts",
          "Safety",
        ],
      },
      {
        name: "Project",
        units: [
          "Problem Statement",
          "Literature Survey",
          "Design",
          "Implementation",
          "Report",
        ],
      },
      {
        name: "Elective I",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
      {
        name: "Elective II",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
    ],
  },
  EE: {
    1: [
      {
        name: "Engineering Physics I",
        units: [
          "Wave Optics",
          "Laser & Fiber Optics",
          "Quantum Mechanics",
          "Band Theory",
          "Superconductivity",
        ],
      },
      {
        name: "Engineering Chemistry",
        units: [
          "Water Chemistry",
          "Polymers",
          "Corrosion",
          "Fuels & Combustion",
          "Spectroscopy",
        ],
      },
      {
        name: "Engineering Mathematics - I",
        units: [
          "Differential Calculus",
          "Integral Calculus",
          "Differential Equations",
          "Laplace Transforms",
          "Vector Calculus",
        ],
      },
      {
        name: "Communication Skills",
        units: ["Grammar", "Reading", "Writing", "Speaking", "Presentation"],
      },
      {
        name: "Constitution of India",
        units: [
          "Historical Background",
          "Preamble & Citizenship",
          "Fundamental Rights",
          "Directive Principles",
          "Amendments",
        ],
      },
      {
        name: "Basics of Civil Engineering",
        units: [
          "Building Materials",
          "Construction",
          "Surveying",
          "Roads & Bridges",
          "Water Supply",
        ],
      },
      {
        name: "Basics of Mechanical Engineering",
        units: [
          "Materials",
          "Manufacturing",
          "Thermodynamics",
          "Fluid Mechanics",
          "Machine Elements",
        ],
      },
      { name: "Engineering Physics Lab I", units: ["Experiments"] },
      { name: "Engineering Chemistry Lab", units: ["Experiments"] },
      { name: "Language Laboratory", units: ["Sessions"] },
      { name: "Engineering Mechanics Lab", units: ["Sessions"] },
      {
        name: "Engineering Physics II",
        units: [
          "EM Theory",
          "Dielectric",
          "Magnetic",
          "Semiconductors",
          "Nano Materials",
        ],
      },
      {
        name: "Engineering Mathematics - II",
        units: [
          "Matrices",
          "Fourier Series",
          "PDE",
          "Z-Transforms",
          "Numerical Methods",
        ],
      },
      {
        name: "Biology for Engineers",
        units: [
          "Cell Biology",
          "Genetics",
          "Biochemistry",
          "Biotechnology",
          "Biomechanics",
        ],
      },
      {
        name: "Environmental Science",
        units: [
          "Ecosystems",
          "Pollution",
          "Natural Resources",
          "Social Issues",
          "Environmental Acts",
        ],
      },
      {
        name: "Basics of Electrical Engineering",
        units: [
          "DC Circuits",
          "AC Circuits",
          "Transformers",
          "Machines",
          "Instruments",
        ],
      },
      {
        name: "Basics of Electronics & Communication Engg",
        units: [
          "Devices",
          "Amplifiers",
          "Digital",
          "Communication",
          "Modulation",
        ],
      },
      {
        name: "Fundamentals of Computing",
        units: ["Computers", "Programming", "Algorithms", "Data Types", "I/O"],
      },
      { name: "Engineering Physics Lab II", units: ["Experiments"] },
      {
        name: "Design Thinking & Idea Lab",
        units: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
      },
      {
        name: "Engineering Graphics & Design",
        units: ["Orthographic", "Isometric", "Sections", "Development", "CAD"],
      },
      {
        name: "Workshop Practice",
        units: ["Carpentry", "Fitting", "Welding", "Plumbing", "Electrical"],
      },
    ],
    2: [
      {
        name: "Circuit Theory",
        units: [
          "Network Fundamentals",
          "Network Theorems",
          "Resonance",
          "Two-Port Networks",
          "Filters",
        ],
      },
      {
        name: "Electronic Devices",
        units: [
          "Semiconductor Physics",
          "Diodes",
          "Transistors",
          "FETs",
          "Special Devices",
        ],
      },
      {
        name: "Electrical Machines I",
        units: [
          "DC Machines",
          "Transformers",
          "AC Machines",
          "Testing",
          "Applications",
        ],
      },
      {
        name: "Signals & Systems",
        units: [
          "Signal Classification",
          "LTI Systems",
          "Fourier Analysis",
          "Laplace",
          "Z-Transform",
        ],
      },
      {
        name: "Mathematics III",
        units: [
          "Complex Analysis",
          "Probability",
          "Statistics",
          "Numerical Methods",
          "Transforms",
        ],
      },
      {
        name: "Electromagnetic Theory",
        units: [
          "Electrostatics",
          "Magnetostatics",
          "Maxwell's Equations",
          "EM Waves",
          "Waveguides",
        ],
      },
    ],
    3: [
      {
        name: "Electrical Machines II",
        units: [
          "Synchronous Machines",
          "Induction Motors",
          "Special Machines",
          "Testing",
          "Drive Systems",
        ],
      },
      {
        name: "Power Systems",
        units: [
          "Transmission Lines",
          "Line Parameters",
          "Power Flow",
          "Fault Analysis",
          "Protection",
        ],
      },
      {
        name: "Control Systems",
        units: [
          "Modeling",
          "Transfer Functions",
          "Time Response",
          "Stability",
          "Frequency Response",
        ],
      },
      {
        name: "Power Electronics",
        units: [
          "Thyristors",
          "Converters",
          "Inverters",
          "Choppers",
          "Applications",
        ],
      },
      {
        name: "Microprocessors",
        units: [
          "8085 Architecture",
          "Instruction Set",
          "Programming",
          "Interfacing",
          "Applications",
        ],
      },
      {
        name: "Instrumentation",
        units: [
          "Transducers",
          "Signal Conditioning",
          "Display",
          "Data Acquisition",
          "Process Control",
        ],
      },
    ],
    4: [
      {
        name: "High Voltage Engineering",
        units: ["Breakdown", "Testing", "Insulation", "HVDC", "Protection"],
      },
      {
        name: "Renewable Energy",
        units: ["Solar", "Wind", "Hydro", "Biomass", "Hybrid Systems"],
      },
      {
        name: "Project",
        units: [
          "Problem Statement",
          "Literature Survey",
          "Design",
          "Implementation",
          "Report",
        ],
      },
      {
        name: "Elective I",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
      {
        name: "Elective II",
        units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      },
    ],
  },
};

const SECTIONS_YEAR1 = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ─── Image Viewer (inline) ───────────────────────────────────────────────────
// PDFs open in new tab — browser PDF viewer handles them natively (no CORS issues)
function FileViewer({ url, title, ext, onClose, onDownload }) {
  const isPdf = ext === "pdf";
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <p className="font-semibold text-black text-sm truncate flex-1 mr-3">
          {isPdf ? "📄" : "🖼"} {title}
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-black text-xs px-3 py-1.5 rounded-lg font-bold"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-800 flex items-center justify-center p-4">
        {imgLoading && !isPdf && (
          <div className="absolute flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Loading...</p>
          </div>
        )}
        {!isPdf && (
          <img
            src={url}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-lg"
            onLoad={() => setImgLoading(false)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ user, activeTab, onClose, onSuccess, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    branch: user?.branch || "CSE",
    year: String(user?.year || "1"),
    section: "all",
    subject: "",
    unit: "",
  });

  const isFirstYear = String(form.year) === "1";
  const subjectOptions = SUBJECTS[form.branch]?.[Number(form.year)] || [];
  const selectedSubjectObj = subjectOptions.find(
    (s) => s.name === form.subject,
  );
  const unitOptions = selectedSubjectObj?.units || [];

  const handleBranchChange = (e) =>
    setForm((f) => ({
      ...f,
      branch: e.target.value,
      subject: "",
      unit: "",
      section: "all",
    }));
  const handleYearChange = (e) =>
    setForm((f) => ({
      ...f,
      year: e.target.value,
      subject: "",
      unit: "",
      section: "all",
    }));
  const handleSubjectChange = (e) =>
    setForm((f) => ({ ...f, subject: e.target.value, unit: "" }));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showToast("Please select a file", "error");
    if (!form.subject) return showToast("Please select a subject", "error");
    // ✅ Unit is now required for notes tab
    if (activeTab === "notes" && unitOptions.length > 0 && !form.unit) {
      return showToast("Please select a unit", "error");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", activeTab);
    formData.append("branch", form.branch);
    formData.append("year", form.year);
    formData.append("section", isFirstYear ? form.section : "all");
    formData.append("subject", form.subject);
    formData.append("unit", form.unit || "General");

    try {
      setUploading(true);

      console.log("unit being sent:", form.unit);
      await api.post("/api/resources", formData);
      onClose();
      onSuccess(); // refetches from API — guarantees unit/all fields are correct
      showToast("Uploaded successfully! 🎉");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const tabLabels = { notes: "Note", pyq: "PYQ", assignment: "Assignment" };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="font-bold text-base text-gray-900">
            Upload {tabLabels[activeTab] || "Resource"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-3">
          <input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">
                Branch
              </label>
              <select
                value={form.branch}
                onChange={handleBranchChange}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              >
                {["CSE", "ECE", "ME", "CE", "EE"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">
                Year
              </label>
              <select
                value={form.year}
                onChange={handleYearChange}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              >
                {["1", "2", "3", "4"].map((y) => (
                  <option key={y} value={y}>
                    {y === "1"
                      ? "1st"
                      : y === "2"
                        ? "2nd"
                        : y === "3"
                          ? "3rd"
                          : "4th"}{" "}
                    Year
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Subject *
            </label>
            <select
              value={form.subject}
              onChange={handleSubjectChange}
              required
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {unitOptions.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">
                Unit *
                <span className="text-red-400 ml-1 font-normal">
                  (required)
                </span>
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
                className={`w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white transition ${
                  !form.unit
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <option value="">— Select Unit —</option>
                {unitOptions.map((u, i) => (
                  <option key={u} value={u}>
                    Unit {i + 1}: {u}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isFirstYear && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">
                Section
              </label>
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              >
                <option value="all">All Sections</option>
                {SECTIONS_YEAR1.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="block cursor-pointer">
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
                file
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {file ? (
                <div>
                  <p className="text-2xl mb-1">
                    {file.name.endsWith(".pdf") ? "📄" : "🖼"}
                  </p>
                  <p className="text-blue-600 text-sm font-semibold truncate">
                    {file.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-3xl mb-2">📎</p>
                  <p className="text-gray-600 text-sm font-medium">
                    Tap to select file
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    PDF, JPG, PNG supported
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="hidden"
            />
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={
                uploading ||
                (activeTab === "notes" && unitOptions.length > 0 && !form.unit)
              }
              className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                `Upload ${tabLabels[activeTab]}`
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Resource Card (reusable) ─────────────────────────────────────────────────
function ResourceCard({ resource, user, onView, onDownload, onDelete }) {
  const ext = resource.fileUrl?.split(".").pop().split("?")[0].toLowerCase();
  const isPdf = !["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  const fileExt = isPdf ? "pdf" : ext;
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
      <span className="text-xl flex-shrink-0">{isPdf ? "📄" : "🖼"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {resource.title}
        </p>
        {resource.description && (
          <p className="text-xs text-gray-400 truncate">
            {resource.description}
          </p>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onView(resource)}
          className="text-xs bg-blue-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-600"
        >
          View
        </button>
        <button
          onClick={() => onDownload(resource.fileUrl, resource.title, fileExt)}
          className="text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-600"
        >
          ⬇
        </button>
        {user._id === resource.uploadedBy?._id?.toString() && (
          <button
            onClick={() => onDelete(resource._id)}
            className="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-100"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Syllabus View for Notes ──────────────────────────────────────────────────
function SyllabusView({ resources, user, onView, onDownload, onDelete }) {
  const branch = user?.branch || "CSE";
  const year = Number(user?.year || 1);
  const subjectList = SUBJECTS[branch]?.[year] || [];
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);

  // Group resources: subject → unit → []
  // A resource matches a unit if r.unit exactly equals the unit name.
  // Resources with no unit / "General" / unrecognised unit go into a catch-all bucket.
  const bySubjectUnit = {};
  resources.forEach((r) => {
    if (!bySubjectUnit[r.subject]) bySubjectUnit[r.subject] = {};
    const bucket = r.unit || "General";
    if (!bySubjectUnit[r.subject][bucket])
      bySubjectUnit[r.subject][bucket] = [];
    bySubjectUnit[r.subject][bucket].push(r);
  });

  const countForSubject = (name) =>
    resources.filter((r) => r.subject === name).length;

  return (
    <div className="space-y-2">
      {subjectList.map((subjectObj) => {
        const subjectName = subjectObj.name;
        const count = countForSubject(subjectName);
        const isOpen = expandedSubject === subjectName;

        // Collect any resources for this subject whose unit doesn't match defined units
        const definedUnitSet = new Set(subjectObj.units);
        const otherResources = Object.entries(bySubjectUnit[subjectName] || {})
          .filter(([unitKey]) => !definedUnitSet.has(unitKey))
          .flatMap(([, arr]) => arr);

        return (
          <div
            key={subjectName}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Subject header */}
            <button
              onClick={() => {
                setExpandedSubject(isOpen ? null : subjectName);
                setExpandedUnit(null);
              }}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {subjectName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {subjectName}
                </p>
                <p className="text-xs text-gray-400">
                  {subjectObj.units.length} units
                  {count > 0 ? ` · ${count} file${count !== 1 ? "s" : ""}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {count > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
                <span
                  className={`text-gray-400 text-sm transition-transform duration-200 inline-block ${isOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </div>
            </button>

            {/* Units list */}
            {isOpen && (
              <div className="border-t border-gray-100">
                {/* ── Defined units ── */}
                {subjectObj.units.map((unit, idx) => {
                  const unitResources =
                    bySubjectUnit[subjectName]?.[unit] || [];
                  const isUnitOpen = expandedUnit === `${subjectName}-${unit}`;

                  return (
                    <div
                      key={unit}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      {/* Unit row — only clickable/expandable if it has files */}
                      <button
                        onClick={() =>
                          unitResources.length > 0 &&
                          setExpandedUnit(
                            isUnitOpen ? null : `${subjectName}-${unit}`,
                          )
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${unitResources.length > 0 ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-500">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium">
                            Unit {idx + 1}: {unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {unitResources.length > 0 ? (
                            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              {unitResources.length}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">
                              No files
                            </span>
                          )}
                          {unitResources.length > 0 && (
                            <span
                              className={`text-gray-400 text-xs inline-block transition-transform duration-200 ${isUnitOpen ? "rotate-180" : ""}`}
                            >
                              ▾
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Files inside unit */}
                      {isUnitOpen && (
                        <div className="bg-gray-50 px-4 pb-3 space-y-2">
                          {unitResources.map((resource) => (
                            <ResourceCard
                              key={resource._id}
                              resource={resource}
                              user={user}
                              onView={onView}
                              onDownload={onDownload}
                              onDelete={onDelete}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ── Catch-all: resources with no matching unit (General / untagged) ── */}
                {otherResources.length > 0 &&
                  (() => {
                    const key = `${subjectName}-__other`;
                    const isOpen2 = expandedUnit === key;
                    return (
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => setExpandedUnit(isOpen2 ? null : key)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                        >
                          <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">📎</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 font-medium">
                              Other / General
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full mr-1">
                            {otherResources.length}
                          </span>
                          <span
                            className={`text-gray-400 text-xs inline-block transition-transform duration-200 ${isOpen2 ? "rotate-180" : ""}`}
                          >
                            ▾
                          </span>
                        </button>
                        {isOpen2 && (
                          <div className="bg-gray-50 px-4 pb-3 space-y-2">
                            {otherResources.map((resource) => (
                              <ResourceCard
                                key={resource._id}
                                resource={resource}
                                user={user}
                                onView={onView}
                                onDownload={onDownload}
                                onDelete={onDelete}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Resources() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [activeSubject, setActiveSubject] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (!user?.branch || !user?.year) {
      setLoading(false);
      return;
    }
    fetchResources();
  }, [user, activeTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/resources/my?type=${activeTab}`);
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await api.delete(`/api/resources/${id}`);
      setResources(resources.filter((r) => r._id !== id));
      showToast("Deleted!");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const getFileExt = (url) => {
    if (!url) return "pdf";
    const rawExt = url.split(".").pop().split("?")[0].toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(rawExt)
      ? rawExt
      : "pdf";
  };

  const handleDownload = (url, title, ext) => {
    // Cloudinary fl_attachment forces browser download instead of open
    let downloadUrl = url;
    if (url && url.includes("/upload/")) {
      downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${title || "file"}.${ext}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleView = (resource) => {
    const ext = getFileExt(resource.fileUrl);
    
    if (ext === "pdf") {
      let viewUrl = resource.fileUrl || "";
      if (!viewUrl.split("?")[0].toLowerCase().endsWith(".pdf")) {
        viewUrl = viewUrl + ".pdf";
      }

      // 📱 Mobile device detection
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Mobile ke liye Google Docs Viewer use karenge taaki download na ho
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(viewUrl)}&embedded=true`;
        window.open(googleViewerUrl, "_blank", "noopener,noreferrer");
      } else {
        // Desktop ke liye normal native viewer best hai
        window.open(viewUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      setViewer({ url: resource.fileUrl, title: resource.title, ext });
    }
  };

  const subjects = ["all", ...new Set(resources.map((r) => r.subject))];
  const filtered =
    activeSubject === "all"
      ? resources
      : resources.filter((r) => r.subject === activeSubject);

  const TABS = [
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "pyq", label: "PYQs", icon: "📋" },
    { id: "assignment", label: "Assignments", icon: "📌" },
  ];

  if (!user?.branch || !user?.year) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="text-xl font-bold mb-2">Setup Your Profile First</h2>
          <p className="text-gray-600 mb-6">
            Add your Branch and Year in your profile to see resources.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-500 text-white px-6 py-3 rounded-full"
          >
            Go to Profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Viewer */}
      {viewer && (
        <FileViewer
          url={viewer.url}
          title={viewer.title}
          ext={viewer.ext}
          onClose={() => setViewer(null)}
          onDownload={() =>
            handleDownload(viewer.url, viewer.title, viewer.ext)
          }
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          user={user}
          activeTab={activeTab}
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchResources()}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {user.branch}
            </span>
            <span className="text-xs text-gray-400">Year {user.year}</span>
            {user.section && (
              <span className="text-xs text-gray-400">
                · Sec {user.section}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-200 transition"
          >
           Upload
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white  w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setActiveSubject("all");
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.id
                ? " underline   text-black  decoration-2 decoration-black  "
                : "text-gray-700 "
            }`}
          >
            <span className="">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── NOTES: Syllabus Tree View ── */}
      {activeTab === "notes" && (
        <>
          {loading ? (
            <div className="text-center py-10 text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading...
            </div>
          ) : (
            <SyllabusView
              resources={resources}
              user={user}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      {/* ── PYQ / ASSIGNMENT: Flat list with subject filter ── */}
      {(activeTab === "pyq" || activeTab === "assignment") && (
        <>
          {/* Subject filter */}
          {subjects.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                    activeSubject === subject
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {subject === "all" ? "All Subjects" : subject}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-4xl mb-3">
                {activeTab === "pyq" ? "📋" : "📌"}
              </p>
              <p className="text-gray-600 font-semibold">
                No{" "}
                {activeTab === "pyq"
                  ? "Previous Year Questions"
                  : "Assignments"}{" "}
                yet
              </p>
              <p className="text-gray-400 text-sm mt-1 mb-4">
                Be the first to upload!
              </p>
              <button
                onClick={() => {
                  setPrefilledUpload(null);
                  setShowUpload(true);
                }}
                className="text-blue-500 text-sm font-semibold hover:underline"
              >
                + Upload {activeTab === "pyq" ? "PYQ" : "Assignment"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((resource) => {
                const ext = getFileExt(resource.fileUrl);
                const tabColor =
                  { pyq: "purple", assignment: "orange" }[activeTab] || "blue";
                const bgMap = {
                  purple: "bg-purple-50",
                  orange: "bg-orange-50",
                };
                const iconMap = { pyq: "📋", assignment: "📌" };
                return (
                  <div
                    key={resource._id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgMap[tabColor]}`}
                      >
                        <span className="text-lg">{iconMap[activeTab]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {resource.title}
                        </p>
                        <p className="text-xs text-blue-500 font-medium">
                          {resource.subject}
                        </p>
                        {resource.unit && resource.unit !== "General" && (
                          <p className="text-xs text-gray-400">
                            Unit: {resource.unit}
                          </p>
                        )}
                        {resource.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {resource.branch}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            Year {resource.year}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {resource.section === "all"
                              ? "All Sections"
                              : `Sec ${resource.section}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleView(resource)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(
                              resource.fileUrl,
                              resource.title,
                              ext,
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          ⬇
                        </button>
                        {user._id === resource.uploadedBy?._id?.toString() && (
                          <button
                            onClick={() => handleDelete(resource._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-500 text-xs px-3 py-1.5 rounded-lg"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
