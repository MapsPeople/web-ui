import React from "react";
import './Wayfinding.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import { ReactComponent as QuestionIcon } from '../../assets/question.svg';

function Wayfinding({ onStartDirections, onBack }) {
    const toSearch = document.getElementById('to');
    const fromSearch = document.getElementById('from');
    const details = document.getElementById('details')

    const resultsContainer = document.getElementById('results');

    if (fromSearch && toSearch) {
        fromSearch.addEventListener('results', e => {
            resultsContainer.innerHTML = '';
            for (const result of e.detail) {
                const listItem = document.createElement('mi-list-item-location');
                listItem.location = result;
                resultsContainer.appendChild(listItem);
            }
        });
        fromSearch.addEventListener('cleared', () => {
            resultsContainer.innerHTML = '';
        });

        toSearch.addEventListener('results', e => {
            resultsContainer.innerHTML = '';
            for (const result of e.detail) {
                const listItem = document.createElement('mi-list-item-location');
                listItem.location = result;
                resultsContainer.appendChild(listItem);
                listItem.addEventListener('locationClicked', console.log('clicked'))
            }
        });
        toSearch.addEventListener('cleared', () => {
            resultsContainer.innerHTML = '';
        })

        toSearch.addEventListener('click', () => {
            details.classList.add('hide');
        });
    }

    return (
        <div className="wayfinding">
            <div className="wayfinding__directions">
                <div className="wayfinding__title">Start wayfinding</div>
                <button className="wayfinding__close" onClick={() => onBack()}>
                    <CloseIcon />
                </button>
                <div className="wayfinding__locations">
                    <div className="wayfinding__to">
                        <div className="wayfinding__label">
                            TO
                        </div>
                        <mi-search placeholder="Search by name, category, building..." id="to" mapsindoors="true"></mi-search>
                    </div>
                    <div className="wayfinding__from">
                        <div className="wayfinding__label">
                            FROM
                        </div>
                        <mi-search placeholder="Search by name, category, building..." id="from" mapsindoors="true"></mi-search>
                    </div>
                </div>
            </div>
            <div className="wayfinding__results" id="results">

            </div>

            <div className="wayfinding__details" id="details">
                <div className="wayfinding__accessibility">
                    <input className="mi-toggle" type="checkbox" />
                    <div>Accessibility</div>
                    <QuestionIcon />
                </div>
                <hr></hr>
                <div className="wayfinding__info">
                    <div className="wayfinding__distance">
                        <WalkingIcon />
                        <div>Distance:</div>
                        <div className="wayfinding__meters">545m</div>
                    </div>
                    <div className="wayfinding__time">
                        <ClockIcon />
                        <div>Estimated time:</div>
                        <div className="wayfinding__minutes">2m</div>
                    </div>
                </div>
                <button className="wayfinding__button" onClick={() => onStartDirections()}>
                    <CheckIcon />
                    Go!
                </button>
            </div>
        </div>
    )
}

export default Wayfinding;
