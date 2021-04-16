  
let btnscrap = document.getElementById('btnscrap')

btnscrap.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    chrome.scripting.executeScript({
        target: { tabId: tab.id},
        function: scrapingProfile,
    })
})

async function scrapingProfile() {

    const cssSelectorsProfile = {
        profile: {
            name: 'div.ph5 > div.mt2 > div > ul > li',
            resumen: 'div.ph5 > div.mt2 > div > ul ~ h2',
            country: 'div.ph5 > div.mt2 > div > ul.mt1 > li.t-16',
            email: 'div > section.pv-contact-info__contact-type.ci-email > div > a',
            phone: 'div > section.pv-contact-info__contact-type.ci-phone > ul > li > span',
        },
        option: {
            buttonSeeMore: '[data-control-name="contact_see_more"]',
            buttonCloseSeeMore: 'button.artdeco-modal__dismiss'
        }
    }

    const wait = (milliseconds) => {
        return new Promise(function(resolve){
            setTimeout(function(){
                resolve()
            }, milliseconds);
        })
    }

    const autoscrollToElement = async function(cssSelector){
        const exists = document.querySelector(cssSelector)

        while (exists){
            let maxScrollTop = document.body.clientHeight - window.innerHeight
            let elementScrollTop = document.querySelector(cssSelector).offsetHeight
            let currentScrollTop = window.scrollY

            if (maxScrollTop == currentScrollTop || elementScrollTop <= currentScrollTop)
                break

            await wait(50)

            let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop)

            window.scrollTo(0, newScrollTop)
        }

        console.log('Finish autoscroll to element %s', cssSelector)

        return new Promise(function(resolve){
            resolve()
        })
    }

    const getContactProfile = async () => {
        const {
            profile: {
                name: nameCss,
                resumen: resumenCss,
                country: countryCss,
                email: emailCss,
                phone: phoneCss,
                experience: experienceCss,
            },
            option: {
                buttonSeeMore: buttonSeeMoreCss,
                buttonCloseSeeMore: buttonCloseSeeMoreCss
            }
        } = cssSelectorsProfile

        const name = document.querySelector(nameCss)?.innerText
        const resumen = document.querySelector(resumenCss)?.innerText
        const country = document.querySelector(countryCss)?.innerText

        const buttonSeeMore = document.querySelector(buttonSeeMoreCss)
        buttonSeeMore.click()
        await wait(1000)
        const email = document.querySelector(emailCss)?.innerText
        const phone = document.querySelector(phoneCss)?.innerText
        const buttonCloseSeeMore = document.querySelector(buttonCloseSeeMoreCss)
        buttonCloseSeeMore.click()
        const experience = getExperiences()

        return { name, resumen, country, experience, email, phone}
    }

    const getProfile = async () => {
        
        await autoscrollToElement('body')
        const profile = await getContactProfile()
        console.log(profile)
    }

    

    const getExperiences = () => {
        const allExperiences = document.querySelector('#experience-section ul')
        const listExperiences = []
        const buttonMoreExperiences = document.querySelector('button.pv-profile-section__see-more-inline')
        if(buttonMoreExperiences != null)
        {
            buttonMoreExperiences.click()
        }
        for (let i = 1; i <= allExperiences.childElementCount; i++) {
            const experience = allExperiences.childNodes[i]
            if(experience.querySelector('ul') == null)
            {
                const occupation = experience.querySelector('h3')?.innerText
                const nameCompany = experience.querySelector('p.t-14')?.innerText
                const duration = experience.querySelectorAll('h4')[0]?.children[1]?.innerText
                const date = experience.querySelectorAll('h4')[1]?.children[1]?.innerText
                const city = experience.querySelectorAll('h4')[2]?.children[1]?.innerText
                listExperiences.push({occupation,nameCompany,duration,date,city})
            }
            else{
                const listSubExperiences = []
                const nameCompany = experience.querySelector('a h3').childNodes[3]?.innerText
                const duration = experience.querySelector('a h4').childNodes[3]?.innerText
                listSubExperiences.push({nameCompany,duration})
                const subExperience = experience.querySelector('ul')
                for (let i = 0; i < subExperience.childElementCount; i++){
                    const e = subExperience.children[i]
                    const occupation = e.querySelector('h3').children[1]?.innerText
                    const duration = e.querySelectorAll('h4')[0]?.children[1]?.innerText
                    const date = e.querySelectorAll('h4')[1]?.children[1]?.innerText
                    const city = e.querySelectorAll('h4')[2]?.children[1]?.innerText
                    listSubExperiences.push({occupation,duration,date,city})
                }
                listExperiences.push(listSubExperiences)            
            }
        }
        return listExperiences
    }

    await getProfile()

    const listEducation = document.querySelector('#education-section ul') 
    for (let i = 0; i < listEducation.childElementCount; i++) {
        const education = listEducation.children[i]
        const institucion = education.querySelector('a h3')?.innerText
        const nombreTitulacion = education.querySelectorAll('a p')[0]?.children[1]?.innerText
        const fecha = education.querySelectorAll('a p')[1]?.children[1]?.innerText

        console.log({institucion,nombreTitulacion,fecha})
    }

    
}
