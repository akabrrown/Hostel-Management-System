'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'
import styles from './page.module.css'

const TABLE_OF_CONTENTS = [
  { id: 'introduction', title: '1.0 Introduction' },
  { id: 'conditions-bed-space', title: '2.0 Conditions For Bed Space' },
  { id: 'residential-policy', title: '3.0 Residential Policy' },
  { id: 'room-bed-allocation', title: '4.0 Room/Bed Allocation Policy' },
  { id: 'administration', title: '5.0 Administration of the Hostel' },
  { id: 'admission-residence', title: '6.0 Admission and Residence' },
  { id: 'vacation', title: '7.0 Vacation' },
  { id: 'facilities', title: '8.0 Facilities in the Hostel' },
  { id: 'visitors', title: '9.0 Visitors to the Hostel' },
  { id: 'perching', title: '10.0 Perching' },
  { id: 'rooms', title: '11.0 Rooms' },
  { id: 'wardrobes', title: '12.0 Wardrobes' },
  { id: 'balcony', title: '13.0 Balcony' },
  { id: 'washrooms', title: '14.0 Washrooms' },
  { id: 'security-property', title: '15.0 Security of Property' },
  { id: 'water', title: '16.0 Water' },
  { id: 'smoking', title: '17.0 Smoking' },
  { id: 'noise', title: '18.0 Noise in the Hostel' },
  { id: 'other-disciplinary', title: '19.0 Other Disciplinary Situations' },
  { id: 'light', title: '20.0 Light' },
  { id: 'electrical-appliances', title: '21.0 Electrical Appliances' },
  { id: 'prohibited-gadgets', title: '22.0 Prohibited Gadgets/Items' },
  { id: 'washing-drying', title: '23.0 Washing and Drying of Clothes' },
  { id: 'motor-vehicles', title: '24.0 Motor Vehicles' },
  { id: 'offences-sanctions', title: '25.0 List of Offences with Sanctions' },
  { id: 'declaration', title: 'Declaration' }
]

export default function RulesPage() {
  const [activeId, setActiveId] = useState<string>('')

  // Handle intersection observer to highlight active TOC item
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100 // Offset for fixed navbar
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Rules and Regulations</h1>
        <p className={styles.heroSubtitle}>
          University of Professional Studies, Accra (UPSA) Hostel
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Sidebar Table of Contents */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Table of Contents</h3>
          <ul className={styles.tocList}>
            {TABLE_OF_CONTENTS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`${styles.tocLink} ${activeId === item.id ? styles.tocLinkActive : ''}`}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content Area */}
        <div className={styles.contentArea}>
          
          <section id="introduction" className={styles.section}>
            <h2 className={styles.sectionTitle}>1.0 Introduction</h2>
            <p className={styles.paragraph}>
              These regulations shall apply to all students residing in the UNIVERSITY OF PROFESSIONAL STUDIES, ACCRA HOSTEL (UPSA Hostel). Students must carefully read the entire Rules and Regulations before they proceed to register as residents. Breach of any rule or regulation governing the Hostel shall not be entertained; offenders shall be severely dealt with.
            </p>
            <p className={styles.paragraph}><strong>Students must take note of the following:</strong></p>
            <ol className={styles.numberedList}>
              <li>Students in UPSA Hostel shall conduct themselves in a quiet and orderly manner and pursue their studies with all diligence; they shall observe the statutes and shall conform to all such regulations and by-laws as may be made for the good governance and smooth administration of the University and the Hostel;</li>
              <li>Any student who fails to observe these Rules and Regulations or found guilty of any offence subversive of discipline or good order, or acts to discredit the Hostel or the University, or neglects his/her duty, he/she shall be punished by a fine, rustication for a limited period or outright withdrawal from the Hostel. It is the responsibility of every student to observe these Rules and Regulations, established for the purposes of developing the educational and moral fiber of the student;</li>
              <li>Ignorance of regulations or any public notice shall not be accepted as an excuse for any breach of discipline. Accordingly, every student on enrolment shall be required to obtain a copy of these Rules and Regulations of the Hostel and any other regulations relating to his condition and are for the time being in force; and</li>
              <li>The operation of these Rules and Regulations is without prejudice to the application of the general laws of Ghana which applies to all persons in the University.</li>
            </ol>
          </section>

          <section id="conditions-bed-space" className={styles.section}>
            <h2 className={styles.sectionTitle}>2.0 Conditions For Bed Space</h2>
            <p className={styles.paragraph}>The following conditions of bed space apply in the UPSA Hostel:</p>
            <ul className={styles.list}>
              <li>Fees paid are strictly not refundable;</li>
              <li>Approval must be sought from the Hostel Manager for the replacement of bed-space.</li>
              <li>Should it become necessary to resell an allocated bed-space on behalf of a student, Management will only refund 75% of the resale amount and not the original amount paid, after the student, has applied for the refund;</li>
              <li>If Hostel is unable to re-sell the bed-space before the semester ends, no refund will be paid to the student;</li>
              <li>A student whose residential status is revoked due to indiscipline shall not be entitled to any refund;</li>
              <li>A student who vacates his/her room on his own during the semester shall not be entitled to any refund;</li>
              <li>The residential hostel fees cover accommodation only.</li>
            </ul>
          </section>

          <section id="residential-policy" className={styles.section}>
            <h2 className={styles.sectionTitle}>3.0 Residential Policy</h2>
            <ul className={styles.list}>
              <li>Levels 100 and 400 students shall be given preference in the admission of students into the UPSA Hostel.</li>
              <li>Students admitted into the Hostel shall be required to be in residence during the whole of the academic year i.e. first and second semesters.</li>
              <li>Under no circumstance shall a student sell or transfer his/her allocated bed to another student without the prior approval of the Hostel Management.</li>
              <li>Residential fees for the year should be paid into UPSA Hostel Account in advance. The fees cover accommodation only. Any further charges covering other facilities would be determined by Management of the University.</li>
            </ul>
          </section>

          <section id="room-bed-allocation" className={styles.section}>
            <h2 className={styles.sectionTitle}>4.0 Room/Bed Allocation Policy</h2>
            <ul className={styles.list}>
              <li>Bed space allocation in UPSA Hostel is not on the basis of first-come first-served. As much as possible students in advanced level shall occupy the down beds. Matured students in lower levels may however, be considered for down beds.</li>
              <li>Student already in residence shall have the right to their bed-space in their original rooms if they so desire.</li>
              <li>Student with genuine medical condition, certified by the Director of the University Health Services, shall be given preference in the allocation of a bed space.</li>
              <li>The Hostel Administration reserves the right to relocate student from a particular room to another room if deemed necessary.</li>
              <li>The Hostel Administration reserves the right to conduct unannounced periodic inspection of rooms/premises of students for health and safety purposes. Students who obstruct these inspections shall be liable to disciplinary action.</li>
            </ul>
          </section>

          <section id="administration" className={styles.section}>
            <h2 className={styles.sectionTitle}>5.0 Administration of the Hostel</h2>
            <p className={styles.paragraph}>There shall be two governance systems in the Hostel namely:</p>
            <ol className={styles.numberedList}>
              <li>Governance of the Hostel/Hall</li>
              <li>Student Governance</li>
            </ol>

            <h3 className={styles.subSectionTitle}>5.1 Governance of the Hostel</h3>
            
            <div className={styles.glassCard}>
              <h4 className="font-bold text-slate-800 mb-2">5.1.1 Hostel Management Committee</h4>
              <p className="text-sm text-slate-600 mb-4">
                The governance of the Hostel shall be vested in the Hostel Management Committee, which shall be the highest decision-making body. The Committee shall formulate policies for the governance of the Hostel. Such policies shall be in line with the statutes of the University and shall be approved by the Executive Committee of the University before implementation.
              </p>
              <p className="text-sm text-slate-600 mb-4">
                The Hostel Management Committee shall be made up of fourteen (14) members namely: the Director of Business Development Centre as Chairman, four (4) Hall Tutors, Dean of Students, four (4) JCR Presidents, the SRC President, the GRASAG President, SRC Women Commissioner and the GRASAG Women Commissioner. The Hostel Administrator shall be the secretary to the Committee.
              </p>

              <h4 className="font-bold text-slate-800 mb-2">5.1.2 Hall Management Committee</h4>
              <p className="text-sm text-slate-600 mb-4">
                Each hall shall also have a Hall Management Committee, which shall be the highest decision-making body for the hall. The Hall Management Committee shall have the following membership: Hall Tutor as Chairman; two (2) members of Convocation affiliated to the Hall; the Hall's JCR President, the JCR General Secretary; and the Director of the Business Development Centre as ex-officio member.
              </p>

              <h4 className="font-bold text-slate-800 mb-2">5.1.3 Hostel Administration Committee</h4>
              <p className="text-sm text-slate-600">
                The Hostel Administration Committee shall be made up of the Director of Business Development Centre and the four (4) Hall Tutors. The Committee shall oversee the general administration of the Hostel. The Director of the Business Development Centre shall be the Chairman of the Committee.
              </p>
            </div>

            <h3 className={styles.subSectionTitle}>5.2 Student Governance</h3>
            <p className={styles.paragraph}>
              The student governance shall be vested in the Junior Common Room (JCR) of the Hall. There shall be a Hall Constitution that outlines the governance of the JCR. The three (3) hierarchy of authority in the student governance structure shall be:
            </p>
            <ol className={styles.numberedList}>
              <li>General Assembly</li>
              <li>The Executive Council</li>
              <li>Judicial Council</li>
            </ol>

            <h3 className={styles.subSectionTitle}>5.3 Responsibilities</h3>
            
            <h4 className="font-bold mt-6 mb-2">5.3.1 The Director of Business Development Centre</h4>
            <p className={styles.paragraph}>
              The Director of the Business Development Centre is the overall head of administration of the Hostel. The Director shall be responsible for the implementation of policies made by the Hostel Management Committee. The Director's responsibilities shall include but not limited to the following:
            </p>
            <ul className={styles.list}>
              <li>To supervise the room allocation process;</li>
              <li>To ensure uninterrupted supply of utility services and proper functioning of all facilities in the Hostel;</li>
              <li>To ensure a peaceful environment that promotes academic and social life in the Hostel;</li>
              <li>To chair meetings of the Hostel Management Committee and Hostel Administration Committee; and</li>
              <li>To present periodic reports on the Hostel to Management of the University.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">5.3.2 The Hall Tutor</h4>
            <ul className={styles.list}>
              <li>To oversee the student governance system in the hall;</li>
              <li>To provide counseling/guidance and academic advisory services to the students of the hall.</li>
              <li>To liaise with the Director of Business Development Centre in all cases relating to the administration of the hall; and</li>
              <li>To report on the governance of the hall to Hostel Management Committee.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">5.3.3 The Hostel Administrator</h4>
            <ul className={styles.list}>
              <li>To be in-charge of the application, registration and allocation of beds;</li>
              <li>To enforce the Rules and Regulations of the Hostel;</li>
              <li>To supervise the Head support staff.</li>
              <li>To oversee residents' welfare.</li>
              <li>To report directly to the Director of Business Development Centre.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">5.3.4 The Head Porter</h4>
            <ul className={styles.list}>
              <li>To supervise and check staff (Porters) in the running of the hostel.</li>
              <li>To ensure that the rooms are clean and tidy with the necessary items for the proper functioning of the room.</li>
              <li>To maintain cleanliness and orderliness in the room.</li>
              <li>To report any issues or problems to the Administrator.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">5.3.5 The Head Security</h4>
            <ul className={styles.list}>
              <li>To supervise the security officer on the morning shift.</li>
              <li>To report any issues or problems to the Administrator.</li>
            </ul>

            <h4 className="font-bold mt-6 mb-2">5.3.6 The Head Cleaner</h4>
            <ul className={styles.list}>
              <li>To supervise the cleaners to maintain a hygienic environment.</li>
              <li>To report directly to the Administrator.</li>
            </ul>
          </section>

          <section id="admission-residence" className={styles.section}>
            <h2 className={styles.sectionTitle}>6.0 Admission and Residence</h2>
            <p className={styles.paragraph}>
              The Hostel admission process shall be managed by a hostel management system software with an online web service which enables online booking and payment for rooms. This service provides an easy and user-friendly web interface that gives students the opportunity to:
            </p>
            <ol className={styles.numberedList}>
              <li>View pictures of rooms and facilities of the Hostel;</li>
              <li>Check if rooms are available;</li>
              <li>Choose room of preference;</li>
              <li>Choose roommates by group booking;</li>
              <li>Pay and fully book their rooms online at any time and place (dependent on payment platform of UPSA); and</li>
              <li>Express their views, suggestions and complaints about the Hostel (accessible by the manager only).</li>
            </ol>
            <p className={styles.paragraph}>
              The management system has an application software that can store the database of all residents of the Hostel and graphically display, on a monitor at the Porters' lodge, the room numbers and pictures of tenants through biometric authentication of finger prints.
            </p>
            <ul className={styles.list}>
              <li>Upon going out of residence during vacation, residents shall be required to hand in the keys of their rooms to the Porter on duty and sign the Final Log-out Book. <strong className={styles.highlightText}>Failure to hand in keys constitutes a major breach of regulations and will attract severe punitive sanction.</strong></li>
              <li>Residents are required to remove all personal property from their rooms before proceeding on their vacation. The Hostel shall not be liable for properties left in the rooms of residence during vacation.</li>
              <li>During the Christmas/Easter break or other inter-semester breaks, residents may leave personal property at their own risk in the special locker rooms provided for that purpose.</li>
            </ul>
          </section>

          <section id="vacation" className={styles.section}>
            <h2 className={styles.sectionTitle}>7.0 Vacation</h2>
            <p className={styles.paragraph}>
              Students shall vacate their rooms in accordance with the University's academic calendar.
            </p>
          </section>

          <section id="facilities" className={styles.section}>
            <h2 className={styles.sectionTitle}>8.0 Facilities in the Hostel</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 list-disc pl-5">
              <li>Study Rooms</li>
              <li>Locker Rooms</li>
              <li>Internet Cafe</li>
              <li>Wi-fi Environment</li>
              <li>Restaurant</li>
              <li>Salon</li>
              <li>Laundrette</li>
              <li>Grocery Shops</li>
              <li>Business Centre</li>
              <li>Junior Common Room</li>
              <li>Elevator</li>
              <li>Generator</li>
              <li>CCTV Security System</li>
            </ul>
          </section>

          <section id="visitors" className={styles.section}>
            <h2 className={styles.sectionTitle}>9.0 Visitors to the Hostel</h2>
            <ul className={styles.list}>
              <li>Visitors are permitted into the Hostel from 8:00 a.m until 10:00 p.m.</li>
              <li>Visitors are permitted to enter and leave the Hostel by the Porters Lodge and by the gates only.</li>
              <li>All visitors must first call at the Porters Lodge and sign the Visitors' Book and wear the "VISITORS ID CARD". It is in the interest of the residents that their visitors register with the Porter on duty upon entering the Hostel.</li>
              <li>Visitors found not to have signed the Visitors' Book shall be considered to have entered the Hostel without authorization.</li>
              <li>Residents must inform all occupants of a pending visitation of their relative or loved one.</li>
              <li>Male students are not permitted to visit the female floors before 7:00 a.m.</li>
            </ul>
            <p className={styles.paragraph}>The Head Porter or any of his staff is authorized to:</p>
            <ul className={styles.list}>
              <li>Refuse admission to visitors outside the permitted hours;</li>
              <li>Demand the names of visitors who may be rude or create a disturbance to leave the Hostel; and</li>
              <li>Ask any visitor who has stayed beyond the permitted hour to leave.</li>
            </ul>
          </section>

          <section id="perching" className={styles.section}>
            <h2 className={styles.sectionTitle}>10.0 Perching</h2>
            <div className={styles.glassCard}>
              <p className="text-slate-500 italic text-sm text-center">
                [Detailed regulations on perching are being updated. Perching remains strictly prohibited.]
              </p>
            </div>
          </section>

          <section id="rooms" className={styles.section}>
            <h2 className={styles.sectionTitle}>11.0 Rooms</h2>
            <ul className={styles.list}>
              <li>Students are not allowed to exchange rooms without permission from the Hostel Administrator.</li>
              <li>Students are required to keep their rooms clean and tidy at all times.</li>
              <li>Students are not allowed to knock nails into walls or woodwork, or use starch/glue to paste time tables, posters, wall papers etc. on walls or furniture as this tends to deface them. The use of candle smoke to make decoration on the ceiling is strictly prohibited.</li>
              <li>Washing of clothes on the balcony, veranda or corridors of the Hostel is prohibited; washing of clothes as much as possible must be done at the washing area provided behind the Hostel block.</li>
              <li>Students who brush their teeth on the balcony, corridors or verandas and throw water over the balcony to the ground or litter the surrounding indiscriminately with garbage are liable to disciplinary action.</li>
              <li>It is prohibited for students to duplicate room/wardrobe keys. Students who lose room keys must report to the Hostel Manager or the Head Porter for immediate replacement.</li>
              <li>Students are expected to clean their own room regularly. Under no circumstance should dirt be swept from a room into the corridor of the Hostel.</li>
              <li>Students are not supposed to drop refuse in the corridors, washroom and on the staircase areas but rather use the bins on each floor of the main block for waste disposal.</li>
              <li>Students shall not paint or decorate their rooms or change locks without authorization. Any such acts of redecoration shall render a student liable to disciplinary action. He/she shall be charged for repainting of the room.</li>
            </ul>
          </section>

          <section id="wardrobes" className={styles.section}>
            <h2 className={styles.sectionTitle}>12.0 Wardrobes</h2>
            <ul className={styles.list}>
              <li>Students are responsible for their wardrobes. They are not supposed to hang clothes on the wardrobe doors.</li>
              <li>Heavy items or suitcases should not be stored in the wardrobe. They may be kept on top of the wardrobes.</li>
            </ul>
          </section>

          <section id="balcony" className={styles.section}>
            <h2 className={styles.sectionTitle}>13.0 Balcony</h2>
            <p className={styles.paragraph}>
              Study tables and chair(s) are not to be left at the balcony. The occupants of the room shall be fined for leaving tables and chair(s) at the balcony unless the culprit is identified.
            </p>
          </section>

          <section id="washrooms" className={styles.section}>
            <h2 className={styles.sectionTitle}>14.0 Washrooms</h2>
            <ul className={styles.list}>
              <li>Flush the W/C after use.</li>
              <li>Do not urinate at the stand pipes area.</li>
              <li>Do not put food particle in the wash hand basin. It chokes it.</li>
              <li>Do not wash your clothes in the washrooms.</li>
              <li>Do not squat on the W/C when using it.</li>
              <li>Do not defecate at the bathroom area.</li>
              <li>Do not use any paper apart from tissue paper when attending to natures' call.</li>
            </ul>
          </section>

          <section id="security-property" className={styles.section}>
            <h2 className={styles.sectionTitle}>15.0 Security of Property</h2>
            
            <h4 className="font-bold mb-2">Access to the Hostel</h4>
            <p className={styles.paragraph}>Students are permitted to enter and leave the Hostel by the Porters' lodge and by the gates.</p>
            
            <h4 className="font-bold mb-2">Hostel Gates</h4>
            <p className={styles.paragraph}>The gate at the Hostel's main entrance and the gate at the Porters' Lodge shall be closed at 12:00 p.m midnight.</p>
            
            <h4 className="font-bold mb-2">Notices</h4>
            <p className={styles.paragraph}>Notices and adverts are strictly to be displayed on the notice boards upon approval by the Director of the Business Development Centre.</p>
            
            <h4 className="font-bold mb-2">Trading in rooms</h4>
            <p className={styles.paragraph}>It is strictly forbidden for students to trade in or allow traders into their rooms. Collective responsibility shall apply and all the room members shall be sanctioned.</p>
            
            <h4 className="font-bold mb-2">Furniture</h4>
            <p className={styles.paragraph}>Moving of furniture or other hostel items out of a room without permission is strictly prohibited.</p>

            <ul className={styles.list}>
              <li>Students are advised, when they leave their rooms for long periods, to ensure that doors are locked and windows securely fastened.</li>
              <li>Students who misplace their wardrobe or door keys shall be made to replace the whole lock with a new one for security reason.</li>
              <li>When leaving the Hostel, all students sharing a common room door keys should deposit the keys at the Porters' Lodge.</li>
              <li>Each student has one drawer or wardrobe which he/she should lock. Keep valuable items secured.</li>
              <li>The Hostel bears no responsibility for cases of theft in residential rooms. Students should report suspicious-looking people immediately.</li>
            </ul>
          </section>

          <section id="water" className={styles.section}>
            <h2 className={styles.sectionTitle}>16.0 Water</h2>
            <ul className={styles.list}>
              <li>Students should ensure that they always lock taps after use and avoid wastage of water.</li>
              <li>Students should be mindful of water usage.</li>
            </ul>
          </section>

          <section id="smoking" className={styles.section}>
            <h2 className={styles.sectionTitle}>17.0 Smoking</h2>
            <p className={styles.paragraph}>
              Smoking is forbidden in the rooms/balcony, library, reading rooms, TV rooms/lavatories and in all public gatherings in the Hostel.
            </p>
          </section>

          <section id="noise" className={styles.section}>
            <h2 className={styles.sectionTitle}>18.0 Noise in the Hostel</h2>
            <ul className={styles.list}>
              <li>The noise from musical instruments, radios, religious noise, human noise etc, must be controlled at all times. The noise should not exceed FIVE (5) DECIBELS.</li>
              <li>Any student making undue noise within the Hostel renders himself/herself liable to disciplinary action.</li>
              <li>Students disturbed by intolerable noise may report to the Porter on duty.</li>
              <li>Public functions require permission 72 hours prior and a refundable deposit of GH¢150.00.</li>
            </ul>
          </section>

          <section id="other-disciplinary" className={styles.section}>
            <h2 className={styles.sectionTitle}>19.0 Other Disciplinary Situations</h2>
            <ul className={styles.list}>
              <li>The cultivation, possession, use and/or peddling of narcotic drugs (including herbs) on campus are punishable by University regulations and state laws.</li>
              <li>The Hostel views willfully causing damage to hostel property as a grievous offence.</li>
              <li>Playing of football or basketball in rooms or on the corridors is strictly prohibited.</li>
              <li>Students causing discomfort to roommates through poor hygiene will not be tolerated.</li>
              <li>Tampering with fire extinguishers, water pumps, electricity meters is a very serious offence resulting in eviction without refund.</li>
            </ul>
          </section>

          <section id="light" className={styles.section}>
            <h2 className={styles.sectionTitle}>20.0 Light</h2>
            <ul className={styles.list}>
              <li>Students shall be required to pay in advance for a quota of electrically charged room air conditioners.</li>
              <li>The lighting and electrical systems must conform to the requirements of the Electrical Code.</li>
              <li>Students are not supposed to use adaptors and plug switches to connect their own equipment.</li>
              <li>Fans, sockets and light fixtures must be properly wired.</li>
            </ul>
          </section>

          <section id="electrical-appliances" className={styles.section}>
            <h2 className={styles.sectionTitle}>21.0 Electrical Appliances</h2>
            <p className={styles.paragraph}>The following electrical appliances may be used in the room:</p>
            <ul className={styles.list}>
              <li>Radio Set</li>
              <li>Electric Iron</li>
              <li>Rice Cooker</li>
              <li>Table Top Fridge</li>
              <li>Television Set (Only one per room, pending unanimous roommate approval)</li>
            </ul>
          </section>

          <section id="prohibited-gadgets" className={styles.section}>
            <h2 className={styles.sectionTitle}>22.0 Prohibited Gadgets/Items</h2>
            <p className={styles.paragraph}>The use of the under-listed gadgets is strictly prohibited:</p>
            <ul className="grid grid-cols-2 gap-2 list-disc pl-5 text-red-700">
              <li>Hot-Plate or Electric Cooker</li>
              <li>Hand Hair Dryer</li>
              <li>Loud Speaker Radio</li>
              <li>Water Heater</li>
              <li>Microwave</li>
              <li>Washing Machine</li>
              <li>Air Conditioner (Unauthorized)</li>
              <li>Washer</li>
              <li>Car Conductor Jack</li>
              <li>Gas Cylinder</li>
            </ul>
          </section>

          <section id="washing-drying" className={styles.section}>
            <h2 className={styles.sectionTitle}>23.0 Washing and Drying of Clothes</h2>
            <p className={styles.paragraph}>
              Clothes must be washed and dried at the washing/drying areas provided at the back of the house. It is forbidden to dry clothes at the outer (external) balcony or on the roof.
            </p>
          </section>

          <section id="motor-vehicles" className={styles.section}>
            <h2 className={styles.sectionTitle}>24.0 Motor Vehicles</h2>
            <ul className={styles.list}>
              <li>Students are responsible for any stolen motor vehicles or for any damage to the property of others.</li>
              <li>The owners of the damaged vehicles must pay a fine.</li>
            </ul>
          </section>

          <section id="offences-sanctions" className={styles.section}>
            <h2 className={styles.sectionTitle}>25.0 List of Offences with Sanctions</h2>
            
            <div className={styles.glassCard}>
              <h3 className="text-xl font-bold text-slate-800 mb-3">25.1 Category "A" Offences</h3>
              <p className="text-slate-500 italic text-sm text-center mb-6">
                [Detailed list pending update]
              </p>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">25.2 Category "B" Offences</h3>
              <p className="text-slate-500 italic text-sm text-center mb-6">
                [Detailed list pending update]
              </p>

              <h3 className="text-xl font-bold text-slate-800 mb-3">25.3 Category "C" Offences</h3>
              <ul className={styles.list}>
                <li>Unnecessary noise-making in the hostel</li>
                <li>Making fun of food or drinking or residence or study</li>
                <li>Walking on the lines</li>
                <li>Littering and littering in the lavatory</li>
                <li>The use of cars to disturb others (screeching)</li>
                <li>Using offensive language</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <h4 className="text-red-800 font-bold mb-2 uppercase">Sanctions Ladder</h4>
                <ol className="list-decimal pl-5 text-red-900 space-y-1 text-sm">
                  <li>The first offence shall attract a warning.</li>
                  <li>The second offence shall attract a punishment or sanction.</li>
                  <li>The third offence shall attract a suspension.</li>
                  <li>The fourth offence shall attract a fine.</li>
                  <li>The fifth offence shall attract a ban.</li>
                </ol>
              </div>
            </div>
          </section>

          <section id="declaration" className={styles.section}>
            <h2 className={styles.sectionTitle}>Declaration</h2>
            <div className={styles.glassCard}>
              <p className="text-slate-500 italic text-sm text-center">
                [Declaration form text pending update]
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
