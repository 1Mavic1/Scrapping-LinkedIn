  
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

            await wait(32)

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

        return { name, resumen, country, email, phone}
    }

    const getProfile = async () => {
        const profile = await getContactProfile()
        await autoscrollToElement('body')
        console.log(profile)
    }

    await getProfile()

    const allExperience = document.querySelector('#experience-section ul')
    for (let i = 1; i <= allExperience.childElementCount; i++) {
        const experience = allExperience.childNodes[i]
        if(experience.querySelector('ul') == null)
        {
            const cargo = experience.querySelector('h3')?.innerText
            const nombreEmpresa = experience.querySelector('p.t-14')?.innerText
            const duracion = experience.querySelectorAll('h4')[0]?.children[1]?.innerText
            const rangoFecha = experience.querySelectorAll('h4')[1]?.children[1]?.innerText
            const ciudad = experience.querySelectorAll('h4')[2]?.children[1]?.innerText
            console.log({cargo,nombreEmpresa,duracion,rangoFecha,ciudad})
        }
        else{
            const nombreEmpresa = experience.querySelector('a h3').childNodes[3]?.innerText
            const duracion = experience.querySelector('a h4').childNodes[3]?.innerText
            console.log({nombreEmpresa,duracion})
            const subExperiencia = experience.querySelector('ul')
            for (let i = 0; i < subExperiencia.childElementCount; i++){
                 const e = subExperiencia.children[i]
                 const cargo = e.querySelector('h3').children[1]?.innerText
                 //const duracion = e.querySelector('h4.t-14').children[1]?.innerText
                 const duracion = e.querySelectorAll('h4')[0]?.children[1]?.innerText
                 const fecha = e.querySelectorAll('h4')[1]?.children[1]?.innerText
                 const ciudad = e.querySelectorAll('h4')[2]?.children[1]?.innerText
                 console.log({cargo,duracion,fecha,ciudad})
            }
        }
    }

    const listEducation = document.querySelector('#education-section ul') 
    for (let i = 0; i < listEducation.childElementCount; i++) {
        const education = listEducation.children[i]
        const institucion = education.querySelector('a h3')?.innerText
        const nombreTitulacion = education.querySelectorAll('a p')[0]?.children[1]?.innerText
        const fecha = education.querySelectorAll('a p')[1]?.children[1]?.innerText

        console.log({institucion,nombreTitulacion,fecha})
    }

    
}